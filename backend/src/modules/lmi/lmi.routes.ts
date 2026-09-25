import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import { LmiController } from './lmi.controller';

const router = Router();
const controller = new LmiController();

// Only ADMIN and INDUSTRY roles can manage/view raw LMI signals in Phase 9
router.get('/', requireAuth, requireRole(['ADMIN', 'INDUSTRY']), controller.getDemandSignals.bind(controller));
router.get('/:id', requireAuth, requireRole(['ADMIN', 'INDUSTRY']), controller.getDemandSignal.bind(controller));
router.post('/', requireAuth, requireRole(['ADMIN']), controller.createDemandSignal.bind(controller));

export default router;
