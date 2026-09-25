import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { prisma } from "../config/database";
import { generateToken } from "../utils/jwt";
import bcrypt from "bcrypt";
import { cleanupAll } from "./test-cleanup";

const app = createApp();

describe("Analytics API", () => {
  let adminToken: string;
  let institutionId: string;
  let student1Id: string;
  let student2Id: string;
  let oppId: string;
  let skillId: string;

  beforeEach(async () => {
    // Clean up in dependency order to avoid FK RESTRICT violations
    await cleanupAll();

    const passwordHash = await bcrypt.hash("password123", 10);

    const institution = await prisma.organization.create({
      data: { name: "Test Institution", type: "INSTITUTION", isVerified: true }
    });
    institutionId = institution.id;

    const admin = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@test.com",
        passwordHash,
        role: "ADMIN",
        institutionId: institution.id,
        isVerified: true
      }
    });
    adminToken = generateToken({ id: admin.id, userId: admin.id, role: admin.role, institutionId: institution.id });

    const student1 = await prisma.user.create({
      data: {
        name: "Student 1",
        email: "student1@test.com",
        passwordHash,
        role: "STUDENT",
        institutionId: institution.id,
        isVerified: true,
        studentProfile: {
          create: { department: "CSE", year: 3 }
        }
      }
    });
    student1Id = student1.id;

    const student2 = await prisma.user.create({
      data: {
        name: "Student 2",
        email: "student2@test.com",
        passwordHash,
        role: "STUDENT",
        institutionId: institution.id,
        isVerified: true,
        studentProfile: {
          create: { department: "ECE", year: 3 }
        }
      }
    });
    student2Id = student2.id;

    const industry = await prisma.organization.create({
      data: { name: "Test Industry", type: "INDUSTRY", isVerified: true }
    });

    const opp = await prisma.opportunity.create({
      data: {
        organizationId: industry.id,
        title: "Software Engineer Intern",
        description: "Test description",
        type: "INTERNSHIP",
        status: "PUBLISHED"
      }
    });
    oppId = opp.id;

    const skill = await prisma.skillTaxonomy.create({
      data: {
        name: "React",
        normalizedName: "react",
        category: "Frontend",
        domain: "IT"
      }
    });
    skillId = skill.id;

    await prisma.opportunitySkill.create({
      data: {
        opportunityId: oppId,
        skillId: skillId,
        requiredProficiency: 4,
        weight: 1
      }
    });

  });

  afterEach(async () => {
    vi.restoreAllMocks();
  });



  it("should get skill gaps with zero-filled missing students", async () => {
    // Only student 1 has the skill with proficiency 4.
    // Total students in institution = 2.
    // Average should be (4 + 0) / 2 = 2.
    const sp1 = await prisma.studentProfile.findUnique({ where: { userId: student1Id } });
    await prisma.studentSkill.create({
      data: {
        studentProfileId: sp1!.id,
        skillId: skillId,
        proficiency: 4
      }
    });

    const res = await request(app)
      .get("/api/analytics/institution/skill-gaps")
      .set("Cookie", [`token=${adminToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].skillName).toBe("React");
    expect(res.body[0].required).toBe(4);
    expect(res.body[0].studentAvg).toBe(2);
  }, 90000);

});
