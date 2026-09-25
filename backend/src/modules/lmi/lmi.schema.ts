import { z } from 'zod';

export const createDemandSignalSchema = z.object({
  sourceType: z.enum(['JOB_POSTING', 'EMPLOYER_SURVEY', 'INDUSTRY_CONSULTATION', 'SECTOR_REPORT', 'PLACEMENT_OUTCOME', 'MANUAL_ENTRY']),
  sourceReference: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  rawRoleTitle: z.string().optional(),
  roleId: z.string().optional(),
  organizationId: z.string().optional(),
  location: z.string().optional(),
  normalizedLocation: z.string().optional(),
  description: z.string().optional(),
  observedAt: z.string().datetime(),
  confidence: z.number().min(0).max(1).optional(),
  isSynthetic: z.boolean().optional(),
  skills: z.array(z.object({
    rawSkillName: z.string(),
    skillId: z.string().nullable().optional(),
    requiredProficiency: z.number().min(1).max(5).optional(),
    isMandatory: z.boolean().optional(),
    evidence: z.string().optional(),
    normalizationMethod: z.string().optional(),
    confidence: z.number().optional()
  })).optional()
});

export const normalizePreviewSchema = z.object({
  title: z.string().min(1, "Title is required"),
  role: z.string().optional(),
  organization: z.string().optional(),
  location: z.string().optional(),
  skills: z.array(z.object({
    name: z.string(),
    evidence: z.string().optional()
  })),
  sourceType: z.enum(['JOB_POSTING', 'EMPLOYER_SURVEY', 'INDUSTRY_CONSULTATION', 'SECTOR_REPORT', 'PLACEMENT_OUTCOME', 'MANUAL_ENTRY']),
  sourceReference: z.string().optional(),
  description: z.string().optional(),
  observedAt: z.string().datetime()
});

// Phase 15: Employer Validation & Outcomes
export const employerValidationSchema = z.object({
  skillId: z.string().optional(),
  programId: z.string().optional(),
  relevance: z.enum(['RELEVANT', 'LOW_RELEVANCE', 'EMERGING_IMPORTANCE']),
  comments: z.string().max(2000).optional()
}).refine(data => data.skillId || data.programId, {
  message: "Validation must specify either a skillId or a programId"
});

export const trainingOutcomeSchema = z.object({
  programId: z.string().min(1, "programId is required"),
  studentId: z.string().min(1, "studentId is required"),
  category: z.enum(['TRAINING_COMPLETED', 'EMPLOYMENT', 'APPRENTICESHIP', 'FURTHER_TRAINING', 'NOT_PLACED', 'UNKNOWN']),
  source: z.string().optional()
});
