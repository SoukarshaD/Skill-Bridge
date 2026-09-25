import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { prisma } from "../config/database";
import { generateToken } from "../utils/jwt";
import bcrypt from "bcrypt";
import { cleanupAll } from "./test-cleanup";

const app = createApp();

describe("LMI Outcomes API", () => {
  let adminToken: string;
  let academicianToken: string;
  let industryToken: string;
  let programId: string;
  let student1Id: string;
  let student2Id: string;
  let student3Id: string;
  let student4Id: string;
  let student5Id: string;
  let orgId: string;
  let adminId: string;

  beforeEach(async () => {
    await cleanupAll();

    const passwordHash = await bcrypt.hash("password123", 10);
    const admin = await prisma.user.create({
      data: { name: "Admin Outcome", email: "admin_out@test.com", passwordHash, role: "ADMIN", isVerified: true }
    });
    adminId = admin.id;
    adminToken = generateToken({ id: admin.id, userId: admin.id, role: admin.role, institutionId: null });

    const aca = await prisma.user.create({
      data: { name: "Aca Outcome", email: "aca_out@test.com", passwordHash, role: "ACADEMICIAN", isVerified: true }
    });
    academicianToken = generateToken({ id: aca.id, userId: aca.id, role: aca.role, institutionId: null });

    const ind = await prisma.user.create({
      data: { name: "Ind Outcome", email: "ind_out@test.com", passwordHash, role: "INDUSTRY", isVerified: true }
    });
    industryToken = generateToken({ id: ind.id, userId: ind.id, role: ind.role, institutionId: null });

    const s1 = await prisma.user.create({ data: { name: "S1", email: "s1@test.com", passwordHash, role: "STUDENT" } });
    const s2 = await prisma.user.create({ data: { name: "S2", email: "s2@test.com", passwordHash, role: "STUDENT" } });
    const s3 = await prisma.user.create({ data: { name: "S3", email: "s3@test.com", passwordHash, role: "STUDENT" } });
    const s4 = await prisma.user.create({ data: { name: "S4", email: "s4@test.com", passwordHash, role: "STUDENT" } });
    const s5 = await prisma.user.create({ data: { name: "S5", email: "s5@test.com", passwordHash, role: "STUDENT" } });
    student1Id = s1.id;
    student2Id = s2.id;
    student3Id = s3.id;
    student4Id = s4.id;
    student5Id = s5.id;

    const org = await prisma.organization.create({ data: { name: "Org Out", type: "INDUSTRY" } });
    orgId = org.id;

    const prog = await prisma.program.create({
       data: {
         title: "Outcome Bootcamp", description: "Learn", type: "WORKSHOP", status: "PUBLISHED",
         organizationId: orgId, organizerId: adminId
       }
    });
    programId = prog.id;
  });

  afterEach(async () => {
    vi.restoreAllMocks();
  });

  describe("Submitting Outcomes", () => {
    it("should allow ADMIN to submit outcome", async () => {
      const res = await request(app)
        .post("/api/lmi/outcomes")
        .set("Cookie", [`token=${adminToken}`])
        .send({
          programId,
          studentId: student1Id,
          category: "EMPLOYMENT",
          source: "MANUAL"
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.outcome.category).toBe("EMPLOYMENT");
    });

    it("should allow ACADEMICIAN to submit outcome", async () => {
      const res = await request(app)
        .post("/api/lmi/outcomes")
        .set("Cookie", [`token=${academicianToken}`])
        .send({
          programId,
          studentId: student2Id,
          category: "TRAINING_COMPLETED",
          source: "SYSTEM"
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("should reject INDUSTRY users from submitting raw outcomes", async () => {
      const res = await request(app)
        .post("/api/lmi/outcomes")
        .set("Cookie", [`token=${industryToken}`])
        .send({ programId, studentId: student1Id, category: "EMPLOYMENT" });
      
      expect(res.status).toBe(403);
    });
  });

  describe("Fetching Outcomes", () => {
     it("should return INSUFFICIENT_DATA for small samples (<5 students)", async () => {
       await prisma.trainingOutcome.create({
         data: { programId, studentId: student1Id, category: "EMPLOYMENT" }
       });
       
       const res = await request(app).get(`/api/lmi/programs/${programId}/outcomes`).set("Cookie", [`token=${adminToken}`]);
       expect(res.status).toBe(200);
       expect(res.body.totalTrackedStudents).toBe(1);
       expect(res.body.evidenceStatus).toBe("INSUFFICIENT_DATA");
       expect(res.body.rates).toBeNull();
     });

     it("should calculate correct rates for sufficient samples (>=5 students)", async () => {
       await prisma.trainingOutcome.createMany({
         data: [
           { programId, studentId: student1Id, category: "EMPLOYMENT" },
           { programId, studentId: student2Id, category: "EMPLOYMENT" },
           { programId, studentId: student3Id, category: "TRAINING_COMPLETED" },
           { programId, studentId: student4Id, category: "APPRENTICESHIP" },
           { programId, studentId: student5Id, category: "NOT_PLACED" }
         ]
       });
       
       const res = await request(app).get(`/api/lmi/programs/${programId}/outcomes`).set("Cookie", [`token=${adminToken}`]);
       expect(res.status).toBe(200);
       expect(res.body.totalTrackedStudents).toBe(5);
       expect(res.body.evidenceStatus).toBe("SUFFICIENT_DATA");
       expect(res.body.rates).toBeDefined();
       
       // 2 Employment out of 5 = 40%
       expect(res.body.rates.employmentRate).toBe(40);
       // 1 Apprenticeship out of 5 = 20%
       expect(res.body.rates.apprenticeshipRate).toBe(20);
     });
  });
});
