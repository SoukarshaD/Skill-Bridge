import { z } from 'zod';

export const opportunitySkillSchema = z.object({
  skillId: z.string().min(1, "Skill ID is required"),
  requiredProficiency: z.number().int().min(1).max(5),
  weight: z.number().min(0.01, "Weight must be greater than 0")
});

export const createOpportunitySchema = z.object({
  type: z.enum(['INTERNSHIP', 'APPRENTICESHIP', 'JOB', 'FACULTY_INTERNSHIP', 'INDUSTRIAL_TRAINING', 'FDP', 'CONSULTANCY', 'RESEARCH_COLLABORATION', 'INNOVATION_CHALLENGE', 'LIVE_PROJECT']),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  duration: z.string().optional(),
  compensation: z.string().optional(),
  location: z.string().optional(),
  workMode: z.enum(['ONSITE', 'REMOTE', 'HYBRID']).default('ONSITE'),
  deadline: z.string().datetime().optional(),
  eligibility: z.object({
    minYear: z.number().int().optional(),
    departments: z.array(z.string()).optional()
  }).optional(),
  requiredSkills: z.array(opportunitySkillSchema).optional(),
  
  // Phase 3 optional extensions
  rules: z.string().optional(),
  evaluationCriteria: z.string().optional(),
  prizes: z.string().optional(),
  certificateAvailable: z.boolean().optional(),
  minTeamSize: z.number().int().min(1).optional(),
  maxTeamSize: z.number().int().min(1).optional()
});

export const updateOpportunitySchema = createOpportunitySchema.partial();
