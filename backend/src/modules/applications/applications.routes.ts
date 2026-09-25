import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import {
  applyToOpportunity,
  getStudentApplications,
  updateApplicationStatus
} from './applications.controller';

const router = Router();

// Student / Academician routes
router.post('/', requireAuth, requireRole(['STUDENT', 'ACADEMICIAN']), applyToOpportunity);
router.get('/me', requireAuth, requireRole(['STUDENT', 'ACADEMICIAN']), getStudentApplications);
router.patch('/:id/withdraw', requireAuth, requireRole(['STUDENT', 'ACADEMICIAN']), (req, res, next) => {
  req.body.status = 'WITHDRAWN';
  updateApplicationStatus(req, res, next);
});

// Industry / Admin route
router.patch('/:id/status', requireAuth, requireRole(['INDUSTRY', 'ADMIN', 'STUDENT']), updateApplicationStatus);

export default router;
