import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import { CareerGuidanceController } from './career-guidance.controller';

const careerGuidanceRouter = Router();
const controller = new CareerGuidanceController();

careerGuidanceRouter.get('/roles', requireAuth, controller.getRoles.bind(controller));
careerGuidanceRouter.get('/recommendations', requireAuth, requireRole(['STUDENT']), controller.getRecommendations.bind(controller));
careerGuidanceRouter.get('/roles/:id', requireAuth, controller.getRole.bind(controller));
careerGuidanceRouter.get('/roles/:id/gaps', requireAuth, requireRole(['STUDENT']), controller.getRoleGaps.bind(controller));
careerGuidanceRouter.get('/path/:roleId', requireAuth, requireRole(['STUDENT']), controller.getCareerPathway.bind(controller));

export { careerGuidanceRouter };
