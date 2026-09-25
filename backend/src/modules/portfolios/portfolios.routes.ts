import { Router } from "express";
import { 
  createPortfolioItem, 
  updatePortfolioItem, 
  deletePortfolioItem, 
  getMyPortfolio, 
  getSharedPortfolio 
} from "./portfolios.controller";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { createPortfolioItemSchema, updatePortfolioItemSchema } from "./portfolios.schema";

const router = Router();

// Public endpoint
router.get("/shared/:studentId", getSharedPortfolio);

// Protected endpoints
router.get("/me", requireAuth, requireRole(["STUDENT"]), getMyPortfolio);

router.post(
  "/items",
  requireAuth,
  requireRole(["STUDENT"]),
  createPortfolioItem
);

router.patch(
  "/items/:id",
  requireAuth,
  requireRole(["STUDENT"]),
  updatePortfolioItem
);

router.delete(
  "/items/:id",
  requireAuth,
  requireRole(["STUDENT"]),
  deletePortfolioItem
);

export default router;
