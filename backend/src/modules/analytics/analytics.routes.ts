import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import {
  getPlacementFunnel,
  getDepartmentOutcomes,
  getIndustryDemand,
  getSkillGaps,
  getReadinessStats,
  getAcademicianParticipations
} from "./analytics.controller";

const router = Router();

// Protect all routes: Only ADMIN (Institution Admins) can access these analytics
router.use(requireAuth, requireRole(["ADMIN"]));

router.get("/funnel", getPlacementFunnel);
router.get("/outcomes", getDepartmentOutcomes);
router.get("/demand", getIndustryDemand);
router.get("/skill-gaps", getSkillGaps);
router.get("/readiness", getReadinessStats);
router.get("/academicians", getAcademicianParticipations);

export default router;
