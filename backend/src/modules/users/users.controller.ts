import { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import {
  updateStudentProfileSchema,
  updateStudentSkillsSchema,
  updateAcademicProfileSchema,
  updateOrganizationSchema,
} from "./users.schema";

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: {
          include: {
            studentSkills: {
              include: { skill: true },
            },
          },
        },
        academicProfile: true,
        institution: true,
        organization: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    // Strip passwordHash before sending to frontend
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user;
    res.status(200).json({ user: safeUser });
  } catch (error) {
    next(error);
  }
};

export const updateStudentProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const data = updateStudentProfileSchema.parse(req.body);

    const profile = await prisma.studentProfile.upsert({
      where: { userId },
      update: data,
      create: { ...data, userId },
    });

    res.status(200).json({ profile });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
    } else {
      next(error);
    }
  }
};

export const updateStudentSkills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { skills } = updateStudentSkillsSchema.parse(req.body);

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!studentProfile) {
      res.status(404).json({ error: "Student profile not found. Please update profile first." });
      return;
    }

    const profileId = studentProfile.id;

    // Use transaction to delete existing skills and insert new ones
    await prisma.$transaction(async (tx) => {
      // Find what existing skills are there
      await tx.studentSkill.deleteMany({
        where: { studentProfileId: profileId },
      });

      if (skills.length > 0) {
        await tx.studentSkill.createMany({
          data: skills.map((s) => ({
            studentProfileId: profileId,
            skillId: s.skillId,
            proficiency: s.proficiency,
          })),
        });
      }
    });

    res.status(200).json({ message: "Skills updated successfully" });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
    } else if (error.code === 'P2003') {
      res.status(400).json({ error: "One or more provided skill IDs are invalid." });
    } else {
      next(error);
    }
  }
};

export const updateAcademicProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const data = updateAcademicProfileSchema.parse(req.body);

    const profile = await prisma.academicProfile.upsert({
      where: { userId },
      update: data,
      create: { ...data, userId },
    });

    res.status(200).json({ profile });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
    } else {
      next(error);
    }
  }
};

export const updateOrganization = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;
    const data = updateOrganizationSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    let targetOrgId = role === "ADMIN" ? user.institutionId : user.organizationId;
    const expectedType = role === "ADMIN" ? "INSTITUTION" : "INDUSTRY";

    if (!targetOrgId) {
      // Create new organization for the user if they don't have one
      if (!data.name) {
        res.status(400).json({ error: "Name is required to create a new organization." });
        return;
      }
      
      const newOrg = await prisma.organization.create({
        data: {
          name: data.name,
          type: expectedType,
          domain: data.domain,
        },
      });

      targetOrgId = newOrg.id;

      // Update the user to point to this organization
      await prisma.user.update({
        where: { id: userId },
        data: role === "ADMIN" ? { institutionId: targetOrgId } : { organizationId: targetOrgId },
      });

      res.status(200).json({ organization: newOrg });
      return;
    }

    // Ensure we are updating the right type of organization
    const existingOrg = await prisma.organization.findUnique({ where: { id: targetOrgId } });
    if (!existingOrg || existingOrg.type !== expectedType) {
      res.status(403).json({ error: "Invalid organization profile context" });
      return;
    }

    const organization = await prisma.organization.update({
      where: { id: targetOrgId },
      data,
    });

    res.status(200).json({ organization });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
    } else {
      next(error);
    }
  }
};
