import { Request, Response, NextFunction } from 'express';
import { programsService } from './programs.service';
import { createProgramSchema, updateProgramSchema, updateRegistrationSchema } from './programs.schema';
import { ProgramStatus, ProgramType } from '@prisma/client';

export const getPrograms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, type } = req.query;
    const programs = await programsService.getPrograms(status as ProgramStatus, type as ProgramType);
    res.json(programs);
  } catch (error) { next(error); }
};

export const getProgramById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const program = await programsService.getProgramById(req.params.id as string);
    let registrationStatus = null;
    
    // Check registration if user is logged in
    const userId = (req as any).user?.id || (req as any).user?.userId;
    if (userId) {
      const reg = await programsService.getMyRegistrations(userId).then(regs => regs.find(r => r.programId === (req.params.id as string)));
      if (reg) registrationStatus = reg.status;
    }

    res.json({ ...program, registrationStatus });
  } catch (error) { next(error); }
};

export const getMyOrganizationPrograms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const orgId = (req as any).user.organizationId;
    if (orgId) {
      const programs = await programsService.getProgramsByOrganization(orgId);
      res.json(programs);
    } else {
      const programs = await programsService.getProgramsByOrganizer(userId);
      res.json(programs);
    }
  } catch (error) { next(error); }
};

export const createProgram = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createProgramSchema.parse(req.body);
    const program = await programsService.createProgram((req as any).user.id, data);
    res.status(201).json(program);
  } catch (error: any) {
    if (error.name === 'ZodError') res.status(400).json({ error: error.errors });
    else next(error);
  }
};

export const updateProgram = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateProgramSchema.parse(req.body);
    const program = await programsService.updateProgram(req.params.id as string, (req as any).user.id, data);
    res.json(program);
  } catch (error: any) {
    if (error.name === 'ZodError') res.status(400).json({ error: error.errors });
    else next(error);
  }
};

export const deleteProgram = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await programsService.deleteProgram(req.params.id as string, (req as any).user.id);
    res.status(204).send();
  } catch (error) { next(error); }
};

export const registerForProgram = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reg = await programsService.registerForProgram(req.params.id as string, (req as any).user.id);
    res.status(201).json(reg);
  } catch (error: any) {
    res.status(409).json({ error: error.message });
  }
};

export const cancelRegistration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reg = await programsService.cancelRegistration(req.params.id as string, (req as any).user.id);
    res.json(reg);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getMyRegistrations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const regs = await programsService.getMyRegistrations((req as any).user.id);
    res.json(regs);
  } catch (error) { next(error); }
};

export const getParticipants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const participants = await programsService.getProgramParticipants(req.params.id as string, (req as any).user.id);
    res.json(participants);
  } catch (error) { next(error); }
};

export const updateParticipant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateRegistrationSchema.parse(req.body);
    const participant = await programsService.updateRegistration(req.params.id as string, req.params.participantId as string, (req as any).user.id, data);
    res.json(participant);
  } catch (error: any) {
    if (error.name === 'ZodError') res.status(400).json({ error: error.errors });
    else next(error);
  }
};

export const getRecommendations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recs = await programsService.getRecommendations((req as any).user.id);
    res.json(recs);
  } catch (error) { next(error); }
};
