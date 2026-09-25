import { z } from "zod";

export const proposeCollaborationSchema = z.object({
  industryId: z.string().optional(),
  academicianId: z.string().optional(),
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum([
    "RESEARCH_COLLABORATION",
    "CONSULTANCY",
    "FDP",
    "INDUSTRIAL_TRAINING",
    "INTERNSHIP",
    "APPRENTICESHIP",
    "JOB",
    "FACULTY_INTERNSHIP"
  ]),
  expertise: z.array(z.string()).optional().default([]),
  expectedOutcomes: z.string().optional(),
  duration: z.string().optional(),
  documentId: z.string().optional(),
});

export const updateCollaborationStatusSchema = z.object({
  status: z.enum(["REVIEWING", "ACCEPTED", "REJECTED", "ACTIVE", "COMPLETED"]),
});
