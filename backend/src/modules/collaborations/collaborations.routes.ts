import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import {
  proposeCollaboration,
  getAcademicianCollaborations,
  getIndustryCollaborations,
  getCollaborationDetails,
  updateCollaborationStatus,
  getIndustryOrganizations
} from "./collaborations.controller";

const router = Router();

// Shared
router.get("/organizations", requireAuth, requireRole(["ACADEMICIAN"]), getIndustryOrganizations);

// Academician routes
router.get("/academician", requireAuth, requireRole(["ACADEMICIAN"]), getAcademicianCollaborations);

// Industry routes
router.get("/industry", requireAuth, requireRole(["INDUSTRY", "ADMIN"]), getIndustryCollaborations);

// Shared
router.post("/propose", requireAuth, requireRole(["ACADEMICIAN", "INDUSTRY", "ADMIN"]), proposeCollaboration);
router.patch("/:id/status", requireAuth, requireRole(["INDUSTRY", "ADMIN", "ACADEMICIAN"]), updateCollaborationStatus);
router.get("/:id", requireAuth, requireRole(["ACADEMICIAN", "INDUSTRY", "ADMIN"]), getCollaborationDetails);

export default router;
