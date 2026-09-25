import { z } from "zod";
import { DocumentType } from "@prisma/client";

export const uploadDocumentSchema = z.object({
  body: z.object({
    type: z.nativeEnum(DocumentType),
    accessPolicy: z.enum(["public", "private"]).default("private"),
  })
});
