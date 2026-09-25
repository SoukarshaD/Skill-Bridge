import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { prisma } from "../config/database";
import { generateToken } from "../utils/jwt";
import bcrypt from "bcrypt";
import { cleanupAll } from "./test-cleanup";

const app = createApp();

describe("LMI Review Flags API", () => {
  let adminToken: string;
  let reactSkillId: string;
  let orgId: string;
  let adminId: string;
  let oversuppliedProgramId: string;
  let obsoleteProgramId: string;
  let nodeSkillId: string;

  beforeEach(async () => {
    await cleanupAll();

    const passwordHash = await bcrypt.hash("password123", 10);
    const admin = await prisma.user.create({
      data: { name: "Admin Review", email: "admin_rev@test.com", passwordHash, role: "ADMIN", isVerified: true }
    });
    adminId = admin.id;
    adminToken = generateToken({ id: admin.id, userId: admin.id, role: admin.role, institutionId: null });

    const org = await prisma.organization.create({ data: { name: "Org Review", type: "INDUSTRY" } });
    orgId = org.id;

    const react = await prisma.skillTaxonomy.create({ data: { name: "React", normalizedName: "react_rev", category: "Tech", domain: "IT" } });
    reactSkillId = react.id;

    const node = await prisma.skillTaxonomy.create({ data: { name: "Node", normalizedName: "node_rev", category: "Tech", domain: "IT" } });
    nodeSkillId = node.id;
  });

  afterEach(async () => {
    vi.restoreAllMocks();
  });

  describe("Oversupply Detection", () => {
    beforeEach(async () => {
      // Small Demand (1)
      await prisma.demandSignal.create({
        data: {
          title: "Low Demand", sourceType: "JOB_POSTING", observedAt: new Date(), status: "PROCESSED",
          skills: { create: [{ rawSkillName: "React", skillId: reactSkillId, confidence: 1.0 }] }
        }
      });

      // Huge Supply (5 programs)
      for (let i = 0; i < 5; i++) {
        await prisma.program.create({
          data: {
            title: `React Bootcamp ${i}`, description: "Desc", type: "WORKSHOP", organizationId: orgId, organizerId: adminId, status: "PUBLISHED", mode: "ONLINE",
            requiredSkills: { create: [{ skillId: reactSkillId }] }
          }
        });
      }
    });

    it("should flag potential skill oversupply", async () => {
      const res = await request(app).get("/api/lmi/oversupply").set("Cookie", [`token=${adminToken}`]);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const reactOversupply = res.body.oversupply.find((s: any) => s.skillId === reactSkillId);
      expect(reactOversupply.flag).toBe('POTENTIAL_OVERSUPPLY');
      expect(reactOversupply.ratio).toBeGreaterThanOrEqual(5.0);
    });
  });



  describe("Obsolescence with fixed data", () => {
     let fixProgId: string;
     beforeEach(async () => {
        // Historical = 4 signals
        const date150 = new Date(new Date().getTime() - (150 * 24 * 60 * 60 * 1000));
        for (let i = 0; i < 4; i++) {
          await prisma.demandSignal.create({
            data: {
              title: `Old Demand ${i}`, sourceType: "JOB_POSTING", observedAt: date150, status: "PROCESSED",
              skills: { create: [{ rawSkillName: "Node", skillId: nodeSkillId, confidence: 1.0 }] }
            }
          });
        }
        
        // Recent = 0 signals
        // So Intelligence Score = 4 * 0.5 = 2.0 (Low demand!)
        // Trend = Recent (0) vs Historical (4). 0 < 4*0.5. DECLINING.

        // High demand for React to drop alignment < 30
        for (let i = 0; i < 15; i++) {
          await prisma.demandSignal.create({
             data: {
               title: "Other Demand", sourceType: "JOB_POSTING", observedAt: new Date(), status: "PROCESSED",
               skills: { create: [{ rawSkillName: "React", skillId: reactSkillId, confidence: 1.0 }] }
             }
          });
        }

        const fix = await prisma.program.create({
          data: {
            title: "Old Node Course", description: "Desc", type: "WORKSHOP", organizationId: orgId, organizerId: adminId, status: "PUBLISHED", mode: "ONLINE",
            requiredSkills: { create: [{ skillId: nodeSkillId }] }
          }
        });
        fixProgId = fix.id;
     });

     it("should correctly flag POTENTIAL_OBSOLESCENCE", async () => {
        const res = await request(app).get(`/api/lmi/programs/${fixProgId}/review-flags`).set("Cookie", [`token=${adminToken}`]);
        expect(res.status).toBe(200);
        
        const flag = res.body.review.flags.find((f: any) => f.flagType === 'POTENTIAL_OBSOLESCENCE');
        expect(flag).toBeDefined();
        expect(flag.severity).toBe('HIGH');
        expect(res.body.review.trendData.trend).toBe('DECLINING');
     });
  });
});
