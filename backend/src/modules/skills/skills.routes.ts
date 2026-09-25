import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { getSkills, createSkill, updateSkill, deleteSkill } from "./skills.controller";

const router = Router();

// Public/Authenticated reading
router.get("/", getSkills);

// Admin only mutation
router.post("/", requireAuth, requireRole(["ADMIN"]), createSkill);
router.put("/:id", requireAuth, requireRole(["ADMIN"]), updateSkill);
router.delete("/:id", requireAuth, requireRole(["ADMIN"]), deleteSkill);

export default router;
