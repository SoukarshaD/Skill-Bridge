import { Request, Response, NextFunction } from 'express';
import { submitChallengeSchema, evaluateChallengeSchema, createTeamSchema } from './challenges.schema';
import { challengeService } from './challenges.service';
import { ChallengeSubmissionStatus } from '@prisma/client';

export const submitToChallenge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = submitChallengeSchema.parse(req.body);
    const studentId = (req as any).user.id;
    const challengeId = req.params.id as string;

    const submission = await challengeService.submit(challengeId, studentId, data);
    res.status(201).json({ submission });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
    } else {
      next(error);
    }
  }
};

export const getChallengeSubmissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const organizerId = (req as any).user.id;
    const challengeId = req.params.id as string;

    const submissions = await challengeService.getSubmissions(challengeId, organizerId);
    res.status(200).json({ submissions });
  } catch (error) {
    next(error);
  }
};

export const getMySubmissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentId = (req as any).user.id;
    const submissions = await challengeService.getMySubmissions(studentId);
    res.status(200).json({ submissions });
  } catch (error) {
    next(error);
  }
};

export const evaluateSubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = evaluateChallengeSchema.parse(req.body);
    const evaluatorId = (req as any).user.id;
    const challengeId = req.params.id as string;
    const submissionId = req.params.submissionId as string;

    const updated = await challengeService.evaluate(challengeId, submissionId, evaluatorId, {
      score: data.score,
      feedback: data.feedback,
      status: data.status as ChallengeSubmissionStatus
    });

    res.status(200).json({ submission: updated });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
    } else {
      next(error);
    }
  }
};

export const updateSubmissionStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const organizerId = (req as any).user.id;
    const challengeId = req.params.id as string;
    const submissionId = req.params.submissionId as string;
    const { status } = req.body;

    const updated = await challengeService.updateStatus(challengeId, submissionId, organizerId, status as ChallengeSubmissionStatus);
    res.status(200).json({ submission: updated });
  } catch (error) {
    next(error);
  }
};

export const createChallengeTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = createTeamSchema.parse(req.body);
    const studentId = (req as any).user.id;
    const challengeId = req.params.id as string;

    const team = await challengeService.createTeam(challengeId, studentId, data);
    res.status(201).json({ team });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
    } else {
      next(error);
    }
  }
};
