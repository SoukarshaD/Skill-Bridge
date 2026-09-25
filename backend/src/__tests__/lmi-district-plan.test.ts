import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { prisma } from "../config/database";
import { generateToken } from "../utils/jwt";
import bcrypt from "bcrypt";
import { cleanupAll } from "./test-cleanup";

const app = createApp();

describe("LMI District Training Plans API", () => {
  let adminToken: string;
  let industryToken: string;
  let reactSkillId: string;
  let pmSkillId: string;
  let orgId: string;
  let adminId: string;
  let localProgId: string;

  beforeEach(async () => {
    await cleanupAll();

    const passwordHash = await bcrypt.hash("password123", 10);
    const admin = await prisma.user.create({
      data: { name: "Admin Plan", email: "admin_plan@test.com", passwordHash, role: "ADMIN", isVerified: true }
    });
    adminId = admin.id;
    adminToken = generateToken({ id: admin.id, userId: admin.id, role: admin.role, institutionId: null });

    const ind = await prisma.user.create({
      data: { name: "Industry", email: "ind_plan@test.com", passwordHash, role: "INDUSTRY", isVerified: true }
    });
    industryToken = generateToken({ id: ind.id, userId: ind.id, role: ind.role, institutionId: null });

    const org = await prisma.organization.create({ data: { name: "Org Plan", type: "INDUSTRY" } });
    orgId = org.id;

    const react = await prisma.skillTaxonomy.create({ data: { name: "React", normalizedName: "react_plan", category: "Tech", domain: "IT" } });
    reactSkillId = react.id;

    const pm = await prisma.skillTaxonomy.create({ data: { name: "PM", normalizedName: "pm_plan", category: "Biz", domain: "IT" } });
    pmSkillId = pm.id;
  });

  afterEach(async () => {
    vi.restoreAllMocks();
  });

  describe("Authorization", () => {
    it("should reject INDUSTRY users from accessing district plans", async () => {
       const res = await request(app).get("/api/lmi/district-plans").set("Cookie", [`token=${industryToken}`]);
       expect(res.status).toBe(403);
    });

    it("should allow ADMIN users", async () => {
       const res = await request(app).get("/api/lmi/district-plans").set("Cookie", [`token=${adminToken}`]);
       expect(res.status).toBe(200);
    });
  });

  describe("District Discovery", () => {
    beforeEach(async () => {
       await prisma.demandSignal.create({
         data: { title: "D1", sourceType: "JOB_POSTING", status: "PROCESSED", observedAt: new Date(), normalizedLocation: "pune" }
       });
       await prisma.demandSignal.create({
         data: { title: "D2", sourceType: "JOB_POSTING", status: "PROCESSED", observedAt: new Date(), normalizedLocation: "mumbai" }
       });
       await prisma.demandSignal.create({
         data: { title: "D3", sourceType: "JOB_POSTING", status: "RAW", observedAt: new Date(), normalizedLocation: "fake_district" }
       });
    });

    it("should return formatted distinct locations for PROCESSED signals", async () => {
       const res = await request(app).get("/api/lmi/district-plans").set("Cookie", [`token=${adminToken}`]);
       expect(res.status).toBe(200);
       expect(res.body.districts).toContain("Pune");
       expect(res.body.districts).toContain("Mumbai");
       expect(res.body.districts).not.toContain("Fake_district");
    });
  });

  describe("Plan Generation", () => {
    beforeEach(async () => {
       // Create High Gap for React in Pune (12 signals)
       for(let i=0; i<12; i++) {
         await prisma.demandSignal.create({
           data: { 
             title: `React Pune ${i}`, sourceType: "JOB_POSTING", status: "PROCESSED", observedAt: new Date(), normalizedLocation: "pune",
             skills: { create: [{ rawSkillName: "React", skillId: reactSkillId, confidence: 1.0 }] }
           }
         });
       }

       // Create Low Demand / High Supply for PM in Pune (1 signal, 3 programs)
       await prisma.demandSignal.create({
         data: { 
           title: `PM Pune`, sourceType: "JOB_POSTING", status: "PROCESSED", observedAt: new Date(), normalizedLocation: "pune",
           skills: { create: [{ rawSkillName: "PM", skillId: pmSkillId, confidence: 1.0 }] }
         }
       });

       for(let i=0; i<3; i++) {
         await prisma.program.create({
           data: {
             title: `PM Course ${i}`, description: "desc", type: "WORKSHOP", status: "PUBLISHED", mode: "OFFLINE", location: "Pune, MH",
             organizationId: orgId, organizerId: adminId,
             requiredSkills: { create: [{ skillId: pmSkillId }] }
           }
         });
       }

       // Create a program that covers React (ONLINE, so it applies to Pune)
       const lp = await prisma.program.create({
          data: {
            title: `Global React`, description: "desc", type: "WORKSHOP", status: "PUBLISHED", mode: "ONLINE",
            organizationId: orgId, organizerId: adminId,
            requiredSkills: { create: [{ skillId: reactSkillId }] }
          }
       });
       localProgId = lp.id;
    });

    it("should calculate gaps, priority, and oversupply deterministically", async () => {
       const res = await request(app).get("/api/lmi/district-plans/pune").set("Cookie", [`token=${adminToken}`]);
       expect(res.status).toBe(200);
       const plan = res.body.plan;
       
       expect(plan.district).toBe("pune");
       expect(plan.evidenceStatus).toBe("SUFFICIENT");
       
       // Priority Skills (React should be HIGH because Gap > 5 and signals >= 5)
       const reactPriority = plan.prioritySkills.find((s:any) => s.skillId === reactSkillId);
       expect(reactPriority).toBeDefined();
       expect(reactPriority.priorityLevel).toBe("HIGH");
       expect(reactPriority.demandScore).toBe(12);
       expect(reactPriority.supplyScore).toBe(1);

       // Oversupply (PM has 1 demand, 3 supply. Ratio = 3.0)
       const pmOversupply = plan.oversuppliedSkills.find((s:any) => s.skillId === pmSkillId);
       expect(pmOversupply).toBeDefined();
       expect(pmOversupply.flag).toBe("POTENTIAL_OVERSUPPLY");

       // Recommended Programs (Global React should appear because it covers React)
       const rec = plan.recommendedPrograms.find((p:any) => p.programId === localProgId);
       expect(rec).toBeDefined();
       expect(rec.coveredPrioritySkills).toContain("React");
       expect(rec.alignmentScore).toBeDefined();
    });
  });

  describe("Insufficient Data Handling", () => {
     beforeEach(async () => {
       // Only 1 demand signal for Nashik
       await prisma.demandSignal.create({
         data: { 
           title: `React Nashik`, sourceType: "JOB_POSTING", status: "PROCESSED", observedAt: new Date(), normalizedLocation: "nashik",
           skills: { create: [{ rawSkillName: "React", skillId: reactSkillId, confidence: 1.0 }] }
         }
       });
     });

     it("should return INSUFFICIENT_DATA status", async () => {
       const res = await request(app).get("/api/lmi/district-plans/nashik").set("Cookie", [`token=${adminToken}`]);
       expect(res.status).toBe(200);
       expect(res.body.plan.evidenceStatus).toBe("INSUFFICIENT_DATA");
       
       const reactPriority = res.body.plan.prioritySkills.find((s:any) => s.skillId === reactSkillId);
       expect(reactPriority.priorityLevel).toBe("INSUFFICIENT_DATA");
     });
  });
});
