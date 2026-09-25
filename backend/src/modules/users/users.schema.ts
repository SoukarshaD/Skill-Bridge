import { z } from "zod";

export const updateStudentProfileSchema = z.object({
  department: z.string().optional(),
  year: z.number().int().optional(),
  targetRoles: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
});

export const updateStudentSkillsSchema = z.object({
  skills: z.array(
    z.object({
      skillId: z.string().min(1, "Skill ID is required"),
      proficiency: z.number().int().min(1).max(5).default(3),
    })
  ),
});

export const updateAcademicProfileSchema = z.object({
  institution: z.string().optional(),
  department: z.string().optional(),
  expertise: z.array(z.string()).optional(),
  researchAreas: z.array(z.string()).optional(),
  consultancyAreas: z.array(z.string()).optional(),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  domain: z.string().optional(),
});
