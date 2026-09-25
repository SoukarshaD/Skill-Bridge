import { Router } from 'express';
import {
  getPrograms,
  getProgramById,
  getMyOrganizationPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  registerForProgram,
  cancelRegistration,
  getMyRegistrations,
  getParticipants,
  updateParticipant,
  getRecommendations
} from './programs.controller';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';

const router = Router();

// Public / Authenticated discovery
router.get('/', requireAuth, getPrograms);
router.get('/recommendations', requireAuth, requireRole(['STUDENT']), getRecommendations);
router.get('/my-registrations', requireAuth, requireRole(['STUDENT', 'ACADEMICIAN']), getMyRegistrations);
router.get('/organization', requireAuth, requireRole(['INDUSTRY', 'ACADEMICIAN']), getMyOrganizationPrograms);

// Program CRUD
router.post('/', requireAuth, requireRole(['INDUSTRY', 'ACADEMICIAN', 'ADMIN']), createProgram);
router.get('/:id', requireAuth, getProgramById);
router.patch('/:id', requireAuth, requireRole(['INDUSTRY', 'ACADEMICIAN', 'ADMIN']), updateProgram);
router.delete('/:id', requireAuth, requireRole(['INDUSTRY', 'ACADEMICIAN', 'ADMIN']), deleteProgram);

// Registration & Participation
router.post('/:id/register', requireAuth, requireRole(['STUDENT', 'ACADEMICIAN']), registerForProgram);
router.post('/:id/cancel', requireAuth, requireRole(['STUDENT', 'ACADEMICIAN']), cancelRegistration);

// Organizer endpoints
router.get('/:id/participants', requireAuth, requireRole(['INDUSTRY', 'ACADEMICIAN', 'ADMIN']), getParticipants);
router.patch('/:id/participants/:participantId', requireAuth, requireRole(['INDUSTRY', 'ACADEMICIAN', 'ADMIN']), updateParticipant);

export const programsRouter = router;
