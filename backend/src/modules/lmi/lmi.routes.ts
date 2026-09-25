import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import { LmiController } from './lmi.controller';

const router = Router();
const controller = new LmiController();

// Intelligence layer (Phase 11, 12, 13, 14) - Read-only for ADMIN and INDUSTRY (plus ACADEMICIAN for alignment insights)
router.get('/skill-gaps', requireAuth, requireRole(['ADMIN', 'INDUSTRY']), controller.getSkillGaps.bind(controller));
router.get('/program-alignment', requireAuth, requireRole(['ADMIN', 'INDUSTRY', 'ACADEMICIAN']), controller.getAllProgramsAlignment.bind(controller));
router.get('/program-alignment/:programId', requireAuth, requireRole(['ADMIN', 'INDUSTRY', 'ACADEMICIAN']), controller.getProgramAlignment.bind(controller));
router.get('/skill-coverage/:skillId', requireAuth, requireRole(['ADMIN', 'INDUSTRY', 'ACADEMICIAN']), controller.getSkillCoverage.bind(controller));
router.get('/oversupply', requireAuth, requireRole(['ADMIN', 'INDUSTRY']), controller.getSkillOversupply.bind(controller));
router.get('/review-flags', requireAuth, requireRole(['ADMIN', 'INDUSTRY']), controller.getAllProgramReviewFlags.bind(controller));
router.get('/programs/:programId/review-flags', requireAuth, requireRole(['ADMIN', 'INDUSTRY', 'ACADEMICIAN']), controller.getProgramReviewFlags.bind(controller));
router.get('/district-plans', requireAuth, requireRole(['ADMIN']), controller.getAvailableDistricts.bind(controller));
router.get('/district-plans/:district', requireAuth, requireRole(['ADMIN']), controller.getDistrictPlan.bind(controller));
router.post('/district-plans/:district/snapshot', requireAuth, requireRole(['ADMIN']), controller.saveDistrictPlanSnapshot.bind(controller));
router.get('/district-plans/:district/history', requireAuth, requireRole(['ADMIN']), controller.getDistrictPlanHistory.bind(controller));

// Phase 15: Employer Validation and Outcomes
router.post('/employer-validations', requireAuth, requireRole(['INDUSTRY']), controller.submitEmployerValidation.bind(controller));
router.get('/skills/:skillId/employer-validations', requireAuth, requireRole(['ADMIN', 'ACADEMICIAN', 'INDUSTRY']), controller.getSkillValidations.bind(controller));
router.get('/programs/:programId/employer-validations', requireAuth, requireRole(['ADMIN', 'ACADEMICIAN', 'INDUSTRY']), controller.getProgramValidations.bind(controller));

// We'll let ADMIN and ACADEMICIAN submit outcomes (e.g. from their perspective or imported)
router.post('/outcomes', requireAuth, requireRole(['ADMIN', 'ACADEMICIAN']), controller.submitOutcome.bind(controller));
router.get('/programs/:programId/outcomes', requireAuth, requireRole(['ADMIN', 'ACADEMICIAN', 'INDUSTRY']), controller.getProgramOutcomes.bind(controller));

// Only ADMIN and INDUSTRY roles can manage/view raw LMI signals in Phase 9
router.get('/', requireAuth, requireRole(['ADMIN', 'INDUSTRY']), controller.getDemandSignals.bind(controller));
router.get('/:id', requireAuth, requireRole(['ADMIN', 'INDUSTRY']), controller.getDemandSignal.bind(controller));
router.post('/normalize-preview', requireAuth, requireRole(['ADMIN']), controller.normalizePreview.bind(controller));
router.post('/', requireAuth, requireRole(['ADMIN']), controller.createDemandSignal.bind(controller));

export default router;
