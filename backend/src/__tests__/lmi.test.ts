import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { prisma } from "../config/database";
import { generateToken } from "../utils/jwt";
import bcrypt from "bcrypt";
import { cleanupAll } from "./test-cleanup";

const app = createApp();



describe("LMI Foundation API", () => {
  let adminToken: string;
  let industryToken: string;
  let studentToken: string;
  let roleId: string;
  let skillId: string;
  let orgId: string;

  beforeEach(async () => {
    await cleanupAll();

    const passwordHash = await bcrypt.hash("password123", 10);

    const admin = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@test.com",
        passwordHash,
        role: "ADMIN",
        isVerified: true
      }
    });
    adminToken = generateToken({ id: admin.id, userId: admin.id, role: admin.role, institutionId: null });

    const industry = await prisma.user.create({
      data: {
        name: "Industry User",
        email: "industry@test.com",
        passwordHash,
        role: "INDUSTRY",
        isVerified: true
      }
    });
    industryToken = generateToken({ id: industry.id, userId: industry.id, role: industry.role, institutionId: null });

    const student = await prisma.user.create({
      data: {
        name: "Student User",
        email: "student@test.com",
        passwordHash,
        role: "STUDENT",
        isVerified: true
      }
    });
    studentToken = generateToken({ id: student.id, userId: student.id, role: student.role, institutionId: null });

    const role = await prisma.careerRole.create({
      data: {
        title: "Software Engineer",
        category: "Engineering"
      }
    });
    roleId = role.id;

    const skill = await prisma.skillTaxonomy.create({
      data: {
        name: "TypeScript",
        normalizedName: "typescript",
        category: "Programming",
        domain: "IT"
      }
    });
    skillId = skill.id;

    const org = await prisma.organization.create({
      data: {
        name: "Test Org",
        type: "INDUSTRY"
      }
    });
    orgId = org.id;
  });

  afterEach(async () => {
    await prisma.demandSignalSkill.deleteMany();
    await prisma.demandSignal.deleteMany();
    vi.restoreAllMocks();
  });

  describe("POST /api/lmi", () => {
    it("should allow ADMIN to create a demand signal with skills", async () => {
      const payload = {
        sourceType: "MANUAL_ENTRY",
        title: "Frontend Need",
        roleId,
        organizationId: orgId,
        observedAt: new Date().toISOString(),
        isSynthetic: true,
        skills: [
          { skillId, requiredProficiency: 4 }
        ]
      };

      const res = await request(app)
        .post("/api/lmi")
        .set("Cookie", [`token=${adminToken}`])
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.signal.skills.length).toBe(1);
    });

    it("should deny INDUSTRY from creating a demand signal", async () => {
      const res = await request(app)
        .post("/api/lmi")
        .set("Cookie", [`token=${industryToken}`])
        .send({ title: "Hack", sourceType: "MANUAL_ENTRY", observedAt: new Date().toISOString() });

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/lmi", () => {
    beforeEach(async () => {
      await prisma.demandSignal.create({
        data: {
          title: "Signal 1",
          sourceType: "JOB_POSTING",
          observedAt: new Date(),
          isSynthetic: true,
          status: "PROCESSED"
        }
      });
      await prisma.demandSignal.create({
        data: {
          title: "Signal 2",
          sourceType: "SECTOR_REPORT",
          observedAt: new Date(),
          isSynthetic: false,
          status: "RAW"
        }
      });
    });

    it("should allow ADMIN to list signals", async () => {
      const res = await request(app)
        .get("/api/lmi")
        .set("Cookie", [`token=${adminToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.signals.length).toBe(2);
    });

    it("should allow filtering by isSynthetic", async () => {
      const res = await request(app)
        .get("/api/lmi?isSynthetic=true")
        .set("Cookie", [`token=${adminToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.signals.length).toBe(1);
      expect(res.body.signals[0].title).toBe("Signal 1");
    });
    
    it("should deny STUDENT from viewing signals", async () => {
      const res = await request(app)
        .get("/api/lmi")
        .set("Cookie", [`token=${studentToken}`]);

      expect(res.status).toBe(403);
    });
  });
});
