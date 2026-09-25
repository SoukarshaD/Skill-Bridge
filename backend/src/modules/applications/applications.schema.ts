import { z } from 'zod';

export const createApplicationSchema = z.object({
  opportunityId: z.string().min(1, "Opportunity ID is required"),
  resumeDocumentId: z.string().optional(),
  portfolioUrl: z.string().url("Must be a valid URL").optional().or(z.literal(''))
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'ACCEPTED', 'DECLINED', 'REJECTED', 'WITHDRAWN'])
});
