import { z } from "zod";

export const createPortfolioItemSchema = z.object({
  body: z.object({
    type: z.string().min(1, "Type is required"), // "project", "certification", "internship", "achievement"
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    date: z.string().datetime().optional().nullable(),
    documentId: z.string().optional().nullable(),
  })
});

export const updatePortfolioItemSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    date: z.string().datetime().optional().nullable(),
    documentId: z.string().optional().nullable(),
  })
});
