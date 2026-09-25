import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { prisma } from "../config/database";
import { generateToken } from "../utils/jwt";
import bcrypt from "bcrypt";
import { cleanupAll } from "./test-cleanup";

const app = createApp();

describe("LMI Intelligence API", () => {
  let adminToken: string;
  let industryToken: string;
  let studentToken: string;
  let reactSkillId: string;
  let pmSkillId: string;
  let orgId: string;
  let adminId: string;

  beforeEach(async () => {
    await cleanupAll();

    const passwordHash = await bcrypt.hash("password123", 10);

    const admin = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin_intel@test.com",
        passwordHash,
        role: "ADMIN",
        isVerified: true
      }
    });
    adminId = admin.id;
    adminToken = generateToken({ id: admin.id, userId: admin.id, role: admin.role, institutionId: null });

    const industry = await prisma.user.create({
      data: {
        name: "Industry User",
        email: "industry_intel@test.com",
        passwordHash,
        role: "INDUSTRY",
        isVerified: true
      }
    });
    industryToken = generateToken({ id: industry.id, userId: industry.id, role: industry.role, institutionId: null });

    const student = await prisma.user.create({
      data: {
        name: "Student User",
        email: "student_intel@test.com",
        passwordHash,
        role: "STUDENT",
        isVerified: true
      }
    });
    studentToken = generateToken({ id: student.id, userId: student.id, role: student.role, institutionId: null });

    const react = await prisma.skillTaxonomy.create({
      data: { name: "React", normalizedName: "react_intel", category: "Tech", domain: "IT" }
    });
    reactSkillId = react.id;

    const pm = await prisma.skillTaxonomy.create({
      data: { name: "Project Management", normalizedName: "pm_intel", category: "Biz", domain: "Management" }
    });
    pmSkillId = pm.id;

    const org = await prisma.organization.create({
      data: { name: "Test Org", type: "INDUSTRY" }
    });
    orgId = org.id;
  });

  afterEach(async () => {
    vi.restoreAllMocks();
  });

  describe("GET /api/lmi/skill-gaps", () => {
    beforeEach(async () => {
      // 1. Demand (React = 12 signals, PM = 2 signals)
      for (let i = 0; i < 12; i++) {
        await prisma.demandSignal.create({
          data: {
            title: `React Demand ${i}`,
            sourceType: "JOB_POSTING",
            observedAt: new Date(),
            status: "PROCESSED",
            location: "Mumbai",
            normalizedLocation: "Mumbai",
            skills: {
              create: [{ rawSkillName: "React", skillId: reactSkillId, confidence: 1.0 }]
            }
          }
        });
      }

      for (let i = 0; i < 2; i++) {
        await prisma.demandSignal.create({
          data: {
            title: `PM Demand ${i}`,
            sourceType: "JOB_POSTING",
            observedAt: new Date(),
            status: "PROCESSED",
            location: "Pune",
            normalizedLocation: "Pune",
            skills: {
              create: [{ rawSkillName: "PM", skillId: pmSkillId, confidence: 1.0 }]
            }
          }
        });
      }

      // 2. Supply (React = 2 programs, PM = 10 programs)
      for (let i = 0; i < 2; i++) {
        await prisma.program.create({
          data: {
            title: `React Program ${i}`,
            description: "Desc",
            type: "WORKSHOP",
            organizationId: orgId,
            organizerId: adminId,
            status: "PUBLISHED",
            mode: "ONLINE",
            requiredSkills: {
              create: [{ skillId: reactSkillId }]
            }
          }
        });
      }

      for (let i = 0; i < 10; i++) {
        await prisma.program.create({
          data: {
            title: `PM Program ${i}`,
            description: "Desc",
            type: "WORKSHOP",
            organizationId: orgId,
            organizerId: adminId,
            status: "PUBLISHED",
            mode: "ONLINE",
            requiredSkills: {
              create: [{ skillId: pmSkillId }]
            }
          }
        });
      }
    });

    it("should allow ADMIN to retrieve skill gaps and classify correctly", async () => {
      const res = await request(app)
        .get("/api/lmi/skill-gaps")
        .set("Cookie", [`token=${adminToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const gaps = res.body.skillGaps;
      expect(gaps.length).toBeGreaterThanOrEqual(2);

      const reactGap = gaps.find((g: any) => g.skillId === reactSkillId);
      expect(reactGap.demandScore).toBe(12);
      expect(reactGap.supplyScore).toBe(2);
      expect(reactGap.gapScore).toBe(10);
      expect(reactGap.gapClassification).toBe("HIGH GAP");
      expect(reactGap.confidence).toBe("HIGH");

      const pmGap = gaps.find((g: any) => g.skillId === pmSkillId);
      expect(pmGap.demandScore).toBe(2);
      expect(pmGap.supplyScore).toBe(10);
      expect(pmGap.gapScore).toBe(-8);
      expect(pmGap.gapClassification).toBe("HIGH SUPPLY");
      expect(pmGap.confidence).toBe("LOW");
    });

    it("should allow INDUSTRY to retrieve skill gaps", async () => {
      const res = await request(app)
        .get("/api/lmi/skill-gaps")
        .set("Cookie", [`token=${industryToken}`]);

      expect(res.status).toBe(200);
    });

    it("should deny STUDENT from retrieving skill gaps", async () => {
      const res = await request(app)
        .get("/api/lmi/skill-gaps")
        .set("Cookie", [`token=${studentToken}`]);

      expect(res.status).toBe(403);
    });

    it("should support location filtering", async () => {
      const res = await request(app)
        .get("/api/lmi/skill-gaps?location=Mumbai")
        .set("Cookie", [`token=${adminToken}`]);

      expect(res.status).toBe(200);
      const gaps = res.body.skillGaps;
      
      const reactGap = gaps.find((g: any) => g.skillId === reactSkillId);
      // React demand is in Mumbai, so it should still be 12.
      expect(reactGap.demandScore).toBe(12);

      const pmGap = gaps.find((g: any) => g.skillId === pmSkillId);
      // PM demand is in Pune, so Mumbai filter should yield 0 demand.
      expect(pmGap.demandScore).toBe(0);
    });
    
    it("should support gap classification filtering", async () => {
      const res = await request(app)
        .get("/api/lmi/skill-gaps?gapClassification=HIGH GAP")
        .set("Cookie", [`token=${adminToken}`]);

      expect(res.status).toBe(200);
      const gaps = res.body.skillGaps;
      
      expect(gaps.length).toBeGreaterThan(0);
      expect(gaps.every((g: any) => g.gapClassification === "HIGH GAP")).toBe(true);
    });
  });
});
