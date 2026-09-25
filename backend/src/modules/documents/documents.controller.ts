import { Request, Response } from "express";
import { PrismaClient, DocumentType } from "@prisma/client";
import { storageService } from "../../utils/storage";
import path from "path";
import stream from "stream";
import { z } from "zod";

const prisma = new PrismaClient();

export const uploadDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    // Body validation was handled by zod middleware, but we need to extract safely
    const { type, accessPolicy } = req.body as { type: DocumentType, accessPolicy: string };

    const ext = path.extname(req.file.originalname).toLowerCase();
    
    // Safety check extension
    const allowedExtensions = ['.pdf', '.png', '.jpeg', '.jpg', '.doc', '.docx'];
    if (!allowedExtensions.includes(ext)) {
      res.status(400).json({ message: "Invalid file extension" });
      return;
    }

    // Convert buffer to stream for storage service
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    const storageKey = await storageService.saveFile(bufferStream, ext);

    const document = await prisma.document.create({
      data: {
        ownerId: req.user.userId,
        type: type,
        filename: req.file.originalname, // We only save the original name for display, not for disk path
        storageKey: storageKey,
        accessPolicy: accessPolicy || "private",
      },
    });

    res.status(201).json(document);
  } catch (error) {
    console.error("Document upload error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const listDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const documents = await prisma.document.findMany({
      where: { ownerId: req.user.userId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(documents);
  } catch (error) {
    console.error("List documents error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const downloadDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const document = await prisma.document.findUnique({
      where: { id: String(id) },
      include: {
        portfolioItems: true
      }
    });

    if (!document) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    // Access control logic
    const isOwner = req.user?.userId === document.ownerId;
    const isExplicitlyPublic = document.accessPolicy === "public";
    // For now, if accessPolicy is private, only the owner can view it
    if (!isOwner && !isExplicitlyPublic) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const fileStream = storageService.getFileStream(document.storageKey);
    const size = await storageService.getFileSize(document.storageKey);

    res.setHeader("Content-Length", size);
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(document.filename)}"`);
    
    // Set appropriate content type
    const ext = path.extname(document.storageKey).toLowerCase();
    if (ext === '.pdf') res.setHeader("Content-Type", "application/pdf");
    else if (ext === '.png') res.setHeader("Content-Type", "image/png");
    else if (ext === '.jpeg' || ext === '.jpg') res.setHeader("Content-Type", "image/jpeg");
    else if (ext === '.doc') res.setHeader("Content-Type", "application/msword");
    else if (ext === '.docx') res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    else res.setHeader("Content-Type", "application/octet-stream");

    fileStream.pipe(res);
  } catch (error) {
    console.error("Download document error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!req.user || !req.user.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const document = await prisma.document.findUnique({
      where: { id: String(id) },
    });

    if (!document) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    if (document.ownerId !== req.user.userId) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    // Check if it's in use
    const usages = await prisma.portfolioItem.count({
      where: { documentId: String(id) }
    });

    if (usages > 0) {
      res.status(400).json({ message: "Cannot delete document because it is linked to a portfolio item." });
      return;
    }

    await prisma.document.delete({
      where: { id: String(id) },
    });
    
    await storageService.deleteFile(document.storageKey);

    res.status(200).json({ message: "Document deleted" });
  } catch (error) {
    console.error("Delete document error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
