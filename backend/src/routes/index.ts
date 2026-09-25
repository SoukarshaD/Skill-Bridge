import { Router, Request, Response } from 'express';
import authRouter from '../modules/auth/auth.routes';
import skillsRouter from '../modules/skills/skills.routes';
import usersRouter from '../modules/users/users.routes';
import opportunitiesRouter from '../modules/opportunities/opportunities.routes';
import applicationsRouter from '../modules/applications/applications.routes';
import learningRouter from '../modules/learning/learning.routes';
import documentsRouter from '../modules/documents/documents.routes';
import portfoliosRouter from '../modules/portfolios/portfolios.routes';
import analyticsRouter from '../modules/analytics/analytics.routes';
import notificationsRouter from '../modules/notifications/notifications.routes';
import collaborationsRouter from '../modules/collaborations/collaborations.routes';
import assessmentsRouter from '../modules/assessments/assessments.routes';
import mentorshipRouter from '../modules/mentorship/mentorship.routes';
import { internshipRouter } from '../modules/internships/internships.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Academia-Industry Portal API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

import { programsRouter } from '../modules/programs/programs.routes';
import { certificatesRouter } from '../modules/certificates/certificates.routes';
import { challengesRouter } from '../modules/challenges/challenges.routes';
import { projectsRouter } from '../modules/projects/projects.routes';
import { careerGuidanceRouter } from '../modules/career-guidance/career-guidance.routes';

router.use('/auth', authRouter);
router.use('/skills', skillsRouter);
router.use('/users', usersRouter);
router.use('/opportunities', opportunitiesRouter);
router.use('/applications', applicationsRouter);
router.use('/learning', learningRouter);
router.use('/documents', documentsRouter);
router.use('/portfolios', portfoliosRouter);
router.use('/analytics/institution', analyticsRouter);
router.use('/notifications', notificationsRouter);
router.use('/collaborations', collaborationsRouter);
router.use('/assessments', assessmentsRouter);
router.use('/mentorship', mentorshipRouter);
router.use('/internships', internshipRouter);
router.use('/programs', programsRouter);
router.use('/certificates', certificatesRouter);
router.use('/challenges', challengesRouter);
router.use('/projects', projectsRouter);
router.use('/career-guidance', careerGuidanceRouter);

export default router;
