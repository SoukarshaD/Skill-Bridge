import { z } from "zod";

export const createSkillSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  domain: z.string().min(1, "Domain is required"),
  relatedRoles: z.array(z.string()).optional(),
});

export const updateSkillSchema = createSkillSchema.partial();
