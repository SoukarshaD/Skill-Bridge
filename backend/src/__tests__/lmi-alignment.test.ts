import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { prisma } from "../config/database";
import { generateToken } from "../utils/jwt";
import bcrypt from "bcrypt";
import { cleanupAll } from "./test-cleanup";

const app = createApp();

describe("LMI Alignment API", () => {
  let adminToken: string;
  let reactSkillId: string;
  let missingSkillId: string;
  let pmSkillId: string;
  let orgId: string;
  let adminId: string;
  let fullProgramId: string;
  let partialProgramId: string;

  beforeEach(async () => {
    await cleanupAll();

    const passwordHash = await bcrypt.hash("password123", 10);
    const admin = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin_align@test.com",
        passwordHash,
        role: "ADMIN",
        isVerified: true
      }
    });
    adminId = admin.id;
    adminToken = generateToken({ id: admin.id, userId: admin.id, role: admin.role, institutionId: null });

    const react = await prisma.skillTaxonomy.create({
      data: { name: "React", normalizedName: "react_align", category: "Tech", domain: "IT" }
    });
    reactSkillId = react.id;

    const pm = await prisma.skillTaxonomy.create({
      data: { name: "PostgreSQL", normalizedName: "pg_align", category: "Tech", domain: "IT" }
    });
    missingSkillId = pm.id;
    
    const node = await prisma.skillTaxonomy.create({
      data: { name: "Node.js", normalizedName: "node_align", category: "Tech", domain: "IT" }
    });
    pmSkillId = node.id;

    const org = await prisma.organization.create({
      data: { name: "Test Org", type: "INDUSTRY" }
    });
    orgId = org.id;
  });

  afterEach(async () => {
    vi.restoreAllMocks();
  });

  describe("GET /api/lmi/program-alignment", () => {
    beforeEach(async () => {
      // Create Demand
      // React = Demand 10 (HIGH)
      for (let i = 0; i < 10; i++) {
        await prisma.demandSignal.create({
          data: {
            title: `React Demand ${i}`,
            sourceType: "JOB_POSTING",
            observedAt: new Date(),
            status: "PROCESSED",
            skills: { create: [{ rawSkillName: "React", skillId: reactSkillId, confidence: 1.0 }] }
          }
        });
      }
      // PostgreSQL = Demand 6 (MODERATE)
      for (let i = 0; i < 6; i++) {
        await prisma.demandSignal.create({
          data: {
            title: `PG Demand ${i}`,
            sourceType: "JOB_POSTING",
            observedAt: new Date(),
            status: "PROCESSED",
            skills: { create: [{ rawSkillName: "PG", skillId: missingSkillId, confidence: 1.0 }] }
          }
        });
      }

      // Create Programs
      // Full Program: Covers React and PostgreSQL
      const full = await prisma.program.create({
        data: {
          title: `Full Stack Masterclass`,
          description: "Desc",
          type: "WORKSHOP",
          organizationId: orgId,
          organizerId: adminId,
          status: "PUBLISHED",
          mode: "ONLINE",
          requiredSkills: {
            create: [{ skillId: reactSkillId }, { skillId: missingSkillId }]
          }
        }
      });
      fullProgramId = full.id;

      // Partial Program: Covers React only
      const partial = await prisma.program.create({
        data: {
          title: `React Basics`,
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
      partialProgramId = partial.id;
    });

    it("should calculate bulk program alignment", async () => {
      const res = await request(app)
        .get("/api/lmi/program-alignment")
        .set("Cookie", [`token=${adminToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const alignments = res.body.alignments;
      expect(alignments.length).toBeGreaterThanOrEqual(2);

      const fullProg = alignments.find((a: any) => a.programId === fullProgramId);
      // It covers React (10) and PG (5) = 15/15 = 100%
      expect(fullProg.alignmentScore).toBe(100);
      expect(fullProg.missingHighGapCount).toBe(0);

      const partialProg = alignments.find((a: any) => a.programId === partialProgramId);
      // Covers React (10) out of total (15) => 10/15 = ~67%
      expect(partialProg.alignmentScore).toBeGreaterThanOrEqual(62);
      expect(partialProg.missingHighGapCount).toBe(1); // Missing PG which has moderate gap
    });

    it("should calculate individual program alignment (partial)", async () => {
      const res = await request(app)
        .get(`/api/lmi/program-alignment/${partialProgramId}`)
        .set("Cookie", [`token=${adminToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const data = res.body.alignment;
      expect(data.programId).toBe(partialProgramId);
      expect(data.coveredSkills.length).toBe(1);
      expect(data.coveredSkills[0].skillId).toBe(reactSkillId);
      
      expect(data.missingSkills.length).toBeGreaterThanOrEqual(1);
      const pgMissing = data.missingSkills.find((s: any) => s.skillId === missingSkillId);
      expect(pgMissing).toBeDefined();
    });

    it("should retrieve skill coverage details", async () => {
      const res = await request(app)
        .get(`/api/lmi/skill-coverage/${reactSkillId}`)
        .set("Cookie", [`token=${adminToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.coverage.skillId).toBe(reactSkillId);
      expect(res.body.coverage.coveringProgramsCount).toBeGreaterThanOrEqual(2);
      expect(res.body.coverage.demandScore).toBe(10);
    });
  });
});
