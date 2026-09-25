import { Router } from 'express';
import { internshipController } from './internships.controller';
import { requireAuth as authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', internshipController.getInternships);
router.get('/:id', internshipController.getInternshipById);
router.post('/start/:applicationId', internshipController.startInternship);
router.post('/:id/portfolio', internshipController.addToPortfolio);

export const internshipRouter = router;
