import { z } from 'zod';
import { ProgramType, ProgramMode, ProgramStatus, RegistrationStatus } from '@prisma/client';

export const createProgramSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  type: z.nativeEnum(ProgramType),
  eligibility: z.any().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  duration: z.string().optional(),
  mode: z.nativeEnum(ProgramMode).optional(),
  location: z.string().optional(),
  registrationDeadline: z.string().datetime().optional(),
  capacity: z.number().int().positive().optional(),
  certificateAvailable: z.boolean().optional(),
  status: z.nativeEnum(ProgramStatus).optional(),
  requiredSkills: z.array(z.object({
    skillId: z.string(),
    requiredProficiency: z.number().min(1).max(5).optional(),
    weight: z.number().min(0).optional()
  })).optional()
});

export const updateProgramSchema = createProgramSchema.partial();

export const updateRegistrationSchema = z.object({
  status: z.nativeEnum(RegistrationStatus),
  feedback: z.string().optional(),
  completionDate: z.string().datetime().optional()
});
