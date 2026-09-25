import { z } from 'zod';

export const startProjectSchema = z.object({
  applicationId: z.string()
});

export const addProjectMilestoneSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional()
});

export const updateProjectMilestoneSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'REVIEWED', 'COMPLETED']),
  deliverableUrl: z.string().url().optional(),
  deliverableDocumentId: z.string().optional(),
  feedback: z.string().optional()
});

export const updateProjectStatusSchema = z.object({
  status: z.enum(['NOT_STARTED', 'ACTIVE', 'COMPLETED', 'CANCELLED']),
  completionSummary: z.string().optional(),
  mentorFeedback: z.string().optional()
});
