import { z } from 'zod';

export const submitChallengeSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  technicalApproach: z.string().optional(),
  repositoryUrl: z.string().url().optional(),
  demoUrl: z.string().url().optional(),
  documentId: z.string().optional(),
  teamId: z.string().optional(),
});

export const evaluateChallengeSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.string().min(10),
  status: z.enum(['SHORTLISTED', 'SELECTED', 'REJECTED']),
});

export const createTeamSchema = z.object({
  name: z.string().min(3),
  memberIds: z.array(z.string()).optional(),
});
