import { Router } from 'express';
import { internshipController } from './internships.controller';
import { requireAuth as authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', internshipController.getInternships);
router.get('/:id', internshipController.getInternshipById);
router.post('/start/:applicationId', internshipController.startInternship);
router.patch('/:id/status', internshipController.updateStatus);

router.post('/:id/milestones', internshipController.addMilestone);
router.patch('/:id/milestones/:milestoneId', internshipController.updateMilestone);

router.post('/:id/updates', internshipController.addProgressUpdate);

router.post('/:id/complete', internshipController.completeInternship);
router.post('/:id/portfolio', internshipController.addToPortfolio);

export const internshipRouter = router;
