import { z } from 'zod';

export const createLearningResourceSkillSchema = z.object({
  skillId: z.string().min(1, "Skill ID is required"),
  targetProficiency: z.number().int().min(1).max(5, "Target proficiency must be an integer between 1 and 5")
});

export const createLearningResourceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  provider: z.string().optional(),
  description: z.string().optional(),
  url: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  duration: z.string().optional(),
  type: z.string().optional(),
  skills: z.array(createLearningResourceSkillSchema).optional()
});

export const updateLearningResourceSchema = createLearningResourceSchema.partial();

export const trackLearningProgressSchema = z.object({
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'])
});
