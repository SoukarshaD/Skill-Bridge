import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import {
  submitToChallenge,
  getChallengeSubmissions,
  getMySubmissions,
  evaluateSubmission,
  createChallengeTeam,
  updateSubmissionStatus
} from './challenges.controller';

export const challengesRouter = Router();

// Student Routes
challengesRouter.post('/:id/submit', requireAuth, requireRole(['STUDENT']), submitToChallenge);
challengesRouter.get('/my-submissions', requireAuth, requireRole(['STUDENT']), getMySubmissions);
challengesRouter.post('/:id/teams', requireAuth, requireRole(['STUDENT']), createChallengeTeam);

// Organizer Routes
challengesRouter.get('/:id/submissions', requireAuth, requireRole(['INDUSTRY', 'ACADEMICIAN', 'ADMIN']), getChallengeSubmissions);
challengesRouter.post('/:id/submissions/:submissionId/evaluate', requireAuth, requireRole(['INDUSTRY', 'ACADEMICIAN', 'ADMIN']), evaluateSubmission);
challengesRouter.patch('/:id/submissions/:submissionId/status', requireAuth, requireRole(['INDUSTRY', 'ACADEMICIAN', 'ADMIN']), updateSubmissionStatus);
