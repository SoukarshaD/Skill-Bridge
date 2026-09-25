import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { prisma } from "../config/database";
import { generateToken } from "../utils/jwt";
import bcrypt from "bcrypt";
import { cleanupAll } from "./test-cleanup";

const app = createApp();

describe("LMI Employer Validation API", () => {
  let adminToken: string;
  let industryToken: string;
  let industryUser2Token: string;
  let skillId: string;
  let programId: string;
  let orgId1: string;
  let orgId2: string;
  let industryUserId: string;

  beforeEach(async () => {
    await cleanupAll();

    const passwordHash = await bcrypt.hash("password123", 10);
    const admin = await prisma.user.create({
      data: { name: "Admin Validation", email: "admin_val@test.com", passwordHash, role: "ADMIN", isVerified: true }
    });
    adminToken = generateToken({ id: admin.id, userId: admin.id, role: admin.role, institutionId: null });

    const org1 = await prisma.organization.create({ data: { name: "Tech Corp 1", type: "INDUSTRY" } });
    orgId1 = org1.id;
    
    const org2 = await prisma.organization.create({ data: { name: "Tech Corp 2", type: "INDUSTRY" } });
    orgId2 = org2.id;

    const ind1 = await prisma.user.create({
      data: { name: "Industry 1", email: "ind1_val@test.com", passwordHash, role: "INDUSTRY", isVerified: true, organizationId: orgId1 }
    });
    industryToken = generateToken({ id: ind1.id, userId: ind1.id, role: ind1.role, organizationId: org1.id, institutionId: null });
    industryUserId = ind1.id;

    const ind2 = await prisma.user.create({
      data: { name: "Industry 2", email: "ind2_val@test.com", passwordHash, role: "INDUSTRY", isVerified: true, organizationId: orgId2 }
    });
    industryUser2Token = generateToken({ id: ind2.id, userId: ind2.id, role: ind2.role, organizationId: org2.id, institutionId: null });

    const skill = await prisma.skillTaxonomy.create({ data: { name: "Docker", normalizedName: "docker_val", category: "Tech", domain: "IT" } });
    skillId = skill.id;

    const prog = await prisma.program.create({
       data: {
         title: "Docker Bootcamp", description: "Learn Docker", type: "WORKSHOP", status: "PUBLISHED",
         organizationId: orgId1, organizerId: admin.id
       }
    });
    programId = prog.id;
  });

  afterEach(async () => {
    vi.restoreAllMocks();
  });

  describe("Submitting Validation", () => {
    it("should allow an authorized industry user to submit validation", async () => {
      const res = await request(app)
        .post("/api/lmi/employer-validations")
        .set("Cookie", [`token=${industryToken}`])
        .send({
          skillId,
          relevance: "RELEVANT",
          comments: "Very important for our cloud stack."
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.validation.relevance).toBe("RELEVANT");
    });

    it("should prevent unauthorized users (ADMIN) from submitting employer validation", async () => {
      const res = await request(app)
        .post("/api/lmi/employer-validations")
        .set("Cookie", [`token=${adminToken}`])
        .send({ skillId, relevance: "RELEVANT" });
      
      expect(res.status).toBe(403);
    });

    it("should upsert duplicate validation from the same employer for the same skill", async () => {
       await request(app)
        .post("/api/lmi/employer-validations")
        .set("Cookie", [`token=${industryToken}`])
        .send({ skillId, relevance: "RELEVANT", comments: "First comment" });

       const res = await request(app)
        .post("/api/lmi/employer-validations")
        .set("Cookie", [`token=${industryToken}`])
        .send({ skillId, relevance: "EMERGING_IMPORTANCE", comments: "Updated comment" });
      
       expect(res.status).toBe(201);
       expect(res.body.validation.relevance).toBe("EMERGING_IMPORTANCE");

       // Verify count in DB
       const count = await prisma.employerValidation.count({ where: { organizationId: orgId1, skillId } });
       expect(count).toBe(1);
    });
  });

  describe("Fetching Validation", () => {
     beforeEach(async () => {
        await prisma.employerValidation.create({
          data: { organizationId: orgId1, userId: industryUserId, skillId, relevance: "RELEVANT" }
        });
        // A second org validates the same program
        await prisma.employerValidation.create({
          data: { organizationId: orgId2, userId: industryUserId, programId, relevance: "LOW_RELEVANCE" }
        });
     });

     it("should aggregate skill validations", async () => {
       const res = await request(app).get(`/api/lmi/skills/${skillId}/employer-validations`).set("Cookie", [`token=${adminToken}`]);
       expect(res.status).toBe(200);
       expect(res.body.totalCount).toBe(1);
       expect(res.body.confidence).toBe("LOW"); // 1 is LOW
       expect(res.body.breakdown.RELEVANT).toBe(1);
     });

     it("should aggregate program validations", async () => {
       const res = await request(app).get(`/api/lmi/programs/${programId}/employer-validations`).set("Cookie", [`token=${adminToken}`]);
       expect(res.status).toBe(200);
       expect(res.body.totalCount).toBe(1);
       expect(res.body.breakdown.LOW_RELEVANCE).toBe(1);
     });
  });
});
