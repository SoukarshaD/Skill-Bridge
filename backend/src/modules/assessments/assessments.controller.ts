import { Request, Response, NextFunction } from 'express';
import { AssessmentService } from './assessments.service';

const assessmentService = new AssessmentService();

export const getAssessments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const assessments = await assessmentService.getPublishedAssessments();
    res.status(200).json(assessments);
  } catch (error) {
    next(error);
  }
};

export const getAssessment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const assessment = await assessmentService.getAssessmentById(req.params.id as string);
    res.status(200).json(assessment);
  } catch (error) {
    next(error);
  }
};

export const startAssessment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const attempt = await assessmentService.startAttempt(req.params.id as string, req.user!.id);
    res.status(201).json(attempt);
  } catch (error) {
    next(error);
  }
};

export const submitAssessment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { answers } = req.body;
    const result = await assessmentService.submitAttempt(req.params.attemptId as string, req.user!.id, answers);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAssessmentResult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await assessmentService.getAttemptResult(req.params.attemptId as string, req.user!.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getMyAttempts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const attempts = await assessmentService.getMyAttempts(req.user!.id);
    res.status(200).json(attempts);
  } catch (error) {
    next(error);
  }
};
