import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import {
  getProfile,
  updateStudentProfile,
  updateStudentSkills,
  updateAcademicProfile,
  updateOrganization,
} from "./users.controller";

const router = Router();

router.use(requireAuth);

router.get("/profile", getProfile);

router.put("/profile/student", requireRole(["STUDENT"]), updateStudentProfile);

router.post("/profile/student/skills", requireRole(["STUDENT"]), updateStudentSkills);

router.put("/profile/academician", requireRole(["ACADEMICIAN"]), updateAcademicProfile);

router.put("/profile/organization", requireRole(["INDUSTRY", "ADMIN"]), updateOrganization);

export default router;
