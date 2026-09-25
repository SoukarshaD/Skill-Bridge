import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import {
  getAssessments,
  getAssessment,
  startAssessment,
  submitAssessment,
  getAssessmentResult,
  getMyAttempts
} from './assessments.controller';

const router = Router();

// Student routes
router.get('/', requireAuth, requireRole(['STUDENT']), getAssessments);
router.get('/my-attempts', requireAuth, requireRole(['STUDENT']), getMyAttempts);
router.get('/:id', requireAuth, requireRole(['STUDENT']), getAssessment);
router.post('/:id/start', requireAuth, requireRole(['STUDENT']), startAssessment);
router.post('/attempts/:attemptId/submit', requireAuth, requireRole(['STUDENT']), submitAssessment);
router.get('/attempts/:attemptId', requireAuth, requireRole(['STUDENT']), getAssessmentResult);

export default router;
