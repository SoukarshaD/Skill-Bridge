import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import {
  getPrograms,
  getProgram,
  createProgram,
  applyForProgram,
  getRequests,
  acceptRequest,
  rejectRequest,
  getMyMentorships,
  getMentorshipDetail,
  addGoal,
  toggleGoal,
  addSession,
  completeMentorship
} from './mentorship.controller';

const router = Router();

// Programs
router.get('/programs', requireAuth, getPrograms);
router.get('/programs/:id', requireAuth, getProgram);
router.post('/programs', requireAuth, requireRole(['INDUSTRY']), createProgram);
router.post('/programs/:id/apply', requireAuth, requireRole(['STUDENT']), applyForProgram);

// Requests
router.get('/requests', requireAuth, requireRole(['INDUSTRY']), getRequests);
router.post('/requests/:id/accept', requireAuth, requireRole(['INDUSTRY']), acceptRequest);
router.post('/requests/:id/reject', requireAuth, requireRole(['INDUSTRY']), rejectRequest);

// Mentorship Management
router.get('/my-mentorships', requireAuth, getMyMentorships);
router.get('/:id', requireAuth, getMentorshipDetail);
router.post('/:id/goals', requireAuth, addGoal);
router.patch('/:id/goals/:goalId', requireAuth, toggleGoal);
router.post('/:id/sessions', requireAuth, requireRole(['INDUSTRY']), addSession);
router.post('/:id/complete', requireAuth, requireRole(['INDUSTRY']), completeMentorship);

export default router;
