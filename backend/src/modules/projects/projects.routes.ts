import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import { ProjectController } from './projects.controller';

export const projectsRouter = Router();
const controller = new ProjectController();

// GET all projects for user
projectsRouter.get('/', requireAuth, controller.getProjects.bind(controller));

// GET project by id
projectsRouter.get('/:id', requireAuth, controller.getProjectById.bind(controller));

// POST start project (from accepted application)
projectsRouter.post('/start/:applicationId', requireAuth, requireRole(['INDUSTRY', 'ACADEMICIAN', 'ADMIN']), controller.startProject.bind(controller));

// PATCH update project status (and issue certificate if completed)
projectsRouter.patch('/:id/status', requireAuth, requireRole(['INDUSTRY', 'ACADEMICIAN', 'ADMIN']), controller.updateStatus.bind(controller));

// POST add milestone
projectsRouter.post('/:id/milestones', requireAuth, requireRole(['INDUSTRY', 'ACADEMICIAN', 'ADMIN']), controller.addMilestone.bind(controller));

// PATCH update milestone (status, deliverables, feedback)
projectsRouter.patch('/:id/milestones/:milestoneId', requireAuth, controller.updateMilestone.bind(controller));
