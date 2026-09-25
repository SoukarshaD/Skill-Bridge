import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import {
  createOpportunity,
  getOrganizationOpportunities,
  getStudentRecommendations,
  getAllPublishedOpportunities,
  getOpportunityDetails,
  getAcademicianOpportunities,
  searchAcademicians
} from './opportunities.controller';

const router = Router();

// Student routes
router.get('/recommendations', requireAuth, requireRole(['STUDENT']), getStudentRecommendations);
router.get('/browse', requireAuth, requireRole(['STUDENT']), getAllPublishedOpportunities);
router.get('/:id', requireAuth, requireRole(['STUDENT', 'INDUSTRY', 'ADMIN', 'ACADEMICIAN']), getOpportunityDetails);

// Industry/Organization routes
router.get('/organization', requireAuth, requireRole(['INDUSTRY', 'ADMIN']), getOrganizationOpportunities);
router.post('/', requireAuth, requireRole(['INDUSTRY', 'ADMIN']), createOpportunity);

router.get('/academicians/search', requireAuth, requireRole(['INDUSTRY', 'ADMIN']), searchAcademicians);

// Academician routes
router.get('/academician/browse', requireAuth, requireRole(['ACADEMICIAN']), getAcademicianOpportunities);

export default router;
