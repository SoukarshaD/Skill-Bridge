import { z } from 'zod';

export const createDemandSignalSchema = z.object({
  sourceType: z.enum(['JOB_POSTING', 'EMPLOYER_SURVEY', 'INDUSTRY_CONSULTATION', 'SECTOR_REPORT', 'PLACEMENT_OUTCOME', 'MANUAL_ENTRY']),
  sourceReference: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  roleId: z.string().optional(),
  organizationId: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  observedAt: z.string().datetime(),
  confidence: z.number().min(0).max(1).optional(),
  isSynthetic: z.boolean().optional(),
  skills: z.array(z.object({
    skillId: z.string(),
    requiredProficiency: z.number().min(1).max(5).optional(),
    isMandatory: z.boolean().optional(),
    evidence: z.string().optional()
  })).optional()
});
