import { Router } from "express";
import { uploadDocument, listDocuments, downloadDocument, deleteDocument } from "./documents.controller";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import multer from "multer";
import { uploadDocumentSchema } from "./documents.schema";
import { Role } from "@prisma/client";

const router = Router();

// Configure multer for memory storage (file buffer passed to controller)
// Limit file size to 5MB here as well as a first line of defense
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

router.post(
  "/",
  requireAuth,
  requireRole(["STUDENT"]),
  upload.single("file"),
  uploadDocument
);

router.get(
  "/",
  requireAuth,
  requireRole(["STUDENT"]),
  listDocuments
);

router.get(
  "/:id/download",
  downloadDocument // Auth/access logic is handled in the controller since some docs can be public
);

router.delete(
  "/:id",
  requireAuth,
  requireRole(["STUDENT"]),
  deleteDocument
);

export default router;
