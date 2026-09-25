import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import {
  createLearningResource,
  updateLearningResource,
  getOrganizationResources,
  getOpportunityLearningRecommendations,
  getMyLearning,
  trackProgress
} from './learning.controller';

const router = Router();

// Industry Routes
router.post('/', requireAuth, requireRole(['INDUSTRY', 'ADMIN']), createLearningResource);
router.patch('/:id', requireAuth, requireRole(['INDUSTRY', 'ADMIN']), updateLearningResource);
router.get('/organization', requireAuth, requireRole(['INDUSTRY', 'ADMIN']), getOrganizationResources);

// Student Routes
router.get('/recommendations/:opportunityId', requireAuth, requireRole(['STUDENT']), getOpportunityLearningRecommendations);
router.get('/me', requireAuth, requireRole(['STUDENT']), getMyLearning);
router.patch('/:id/progress', requireAuth, requireRole(['STUDENT']), trackProgress);

export default router;
