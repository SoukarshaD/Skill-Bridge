import { z } from 'zod';
import { CertificateSourceType, CertificateVerificationMethod, VerificationStatus } from '@prisma/client';

export const createCertificateSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  issuer: z.string().min(1, 'Issuer is required'),
  description: z.string().optional(),
  issueDate: z.string().datetime({ message: 'Invalid issue date' }),
  expiryDate: z.string().datetime().optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().url().optional().or(z.literal('')),
  documentId: z.string().optional(),
  sourceType: z.nativeEnum(CertificateSourceType).default('EXTERNAL'),
  sourceId: z.string().optional(),
  isPublic: z.boolean().default(false),
  skillIds: z.array(z.string()).optional(),
});

export const updateCertificateSchema = createCertificateSchema.partial().omit({ sourceType: true, sourceId: true });

export const verifyCertificateSchema = z.object({
  rejectionReason: z.string().optional(),
});

export type CreateCertificateInput = z.infer<typeof createCertificateSchema>;
export type UpdateCertificateInput = z.infer<typeof updateCertificateSchema>;
