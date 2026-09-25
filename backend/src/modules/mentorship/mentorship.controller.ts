import { Request, Response, NextFunction } from 'express';
import { MentorshipService } from './mentorship.service';

const service = new MentorshipService();

export const getPrograms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const programs = await service.getPrograms();
    res.json(programs);
  } catch (error) { next(error); }
};

export const getProgram = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const program = await service.getProgramById(req.params.id as string);
    if (!program) return res.status(404).json({ error: 'Not found' });
    res.json(program);
  } catch (error) { next(error); }
};

export const createProgram = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const program = await service.createProgram((req as any).user.userId || (req as any).user.id, req.body);
    res.status(201).json(program);
  } catch (error) { next(error); }
};

export const applyForProgram = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { objectives } = req.body;
    const mentorship = await service.applyForMentorship((req as any).user.userId || (req as any).user.id, req.params.id as string, objectives);
    res.status(201).json(mentorship);
  } catch (error) { next(error); }
};

export const getRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requests = await service.getMentorRequests((req as any).user.userId || (req as any).user.id);
    res.json(requests);
  } catch (error) { next(error); }
};

export const acceptRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const m = await service.acceptRequest((req as any).user.userId || (req as any).user.id, req.params.id as string);
    res.json(m);
  } catch (error) { next(error); }
};

export const rejectRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const m = await service.rejectRequest((req as any).user.userId || (req as any).user.id, req.params.id as string);
    res.json(m);
  } catch (error) { next(error); }
};

export const getMyMentorships = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ms = await service.getMyMentorships((req as any).user.userId || (req as any).user.id, (req as any).user.role);
    res.json(ms);
  } catch (error) { next(error); }
};

export const getMentorshipDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const m = await service.getMentorshipById(req.params.id as string, (req as any).user.userId || (req as any).user.id);
    res.json(m);
  } catch (error) { next(error); }
};

export const addGoal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title } = req.body;
    const goal = await service.addGoal(req.params.id as string, (req as any).user.userId || (req as any).user.id, title);
    res.status(201).json(goal);
  } catch (error) { next(error); }
};

export const toggleGoal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const goal = await service.toggleGoal(req.params.goalId as string, (req as any).user.userId || (req as any).user.id);
    res.json(goal);
  } catch (error) { next(error); }
};

export const addSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await service.addSession(req.params.id as string, (req as any).user.userId || (req as any).user.id, req.body);
    res.status(201).json(session);
  } catch (error) { next(error); }
};

export const completeMentorship = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { feedback } = req.body;
    const m = await service.completeMentorship(req.params.id as string, (req as any).user.userId || (req as any).user.id, feedback);
    res.json(m);
  } catch (error) { next(error); }
};
