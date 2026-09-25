import { Request, Response } from "express";
import { PrismaClient, VerificationStatus } from "@prisma/client";

const prisma = new PrismaClient();

// Add a portfolio item
export const createPortfolioItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, title, description, date, documentId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (documentId) {
      const doc = await prisma.document.findUnique({ where: { id: documentId } });
      if (!doc || doc.ownerId !== userId) {
        res.status(403).json({ message: "Invalid document attached" });
        return;
      }
    }

    const item = await prisma.portfolioItem.create({
      data: {
        studentId: userId,
        type,
        title,
        description,
        date: date ? new Date(date) : null,
        documentId,
        verificationStatus: VerificationStatus.SELF_REPORTED, // Explicitly safe
      },
      include: {
        document: true,
      }
    });

    res.status(201).json(item);
  } catch (error) {
    console.error("Create portfolio item error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update an existing item
export const updatePortfolioItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, date, documentId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const existing = await prisma.portfolioItem.findUnique({ where: { id: String(id) } });
    if (!existing || existing.studentId !== userId) {
      res.status(404).json({ message: "Item not found" });
      return;
    }

    if (documentId && documentId !== existing.documentId) {
      const doc = await prisma.document.findUnique({ where: { id: documentId } });
      if (!doc || doc.ownerId !== userId) {
        res.status(403).json({ message: "Invalid document attached" });
        return;
      }
    }

    const updated = await prisma.portfolioItem.update({
      where: { id: String(id) },
      data: {
        title,
        description,
        date: date ? new Date(date) : null,
        documentId: documentId === null ? null : documentId, // Allow unlinking
      },
      include: {
        document: true,
      }
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error("Update portfolio item error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePortfolioItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const existing = await prisma.portfolioItem.findUnique({ where: { id: String(id) } });
    if (!existing || existing.studentId !== userId) {
      res.status(404).json({ message: "Item not found" });
      return;
    }

    await prisma.portfolioItem.delete({ where: { id: String(id) } });
    res.status(200).json({ message: "Item deleted" });
  } catch (error) {
    console.error("Delete portfolio item error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Gets the current user's full aggregated portfolio (private & public info)
export const getMyPortfolio = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Use shared logic, but could include more private things if needed later
    const aggregated = await aggregatePortfolioData(userId);
    res.status(200).json(aggregated);
  } catch (error) {
    console.error("Get my portfolio error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Public endpoint for sharing
export const getSharedPortfolio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const aggregated = await aggregatePortfolioData(String(studentId), true);
    
    if (!aggregated) {
      res.status(404).json({ message: "Portfolio not found" });
      return;
    }
    
    res.status(200).json(aggregated);
  } catch (error) {
    console.error("Get shared portfolio error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

async function aggregatePortfolioData(userId: string, isPublic: boolean = false) {
  const user = await prisma.user.findUnique({
    where: { id: userId, role: "STUDENT" },
    include: {
      studentProfile: {
        include: {
          studentSkills: {
            include: { skill: true }
          },
          studentLearningResources: {
            where: { status: "COMPLETED" },
            include: { learningResource: true }
          }
        }
      },
      portfolioItems: {
        include: { document: true },
        orderBy: { date: 'desc' }
      }
    }
  });

  if (!user || !user.studentProfile) {
    return null;
  }

  // Aggregate items with clear source tagging
  const aggregatedTimeline = [
    // Add completed learning resources
    ...user.studentProfile.studentLearningResources.map((lr: any) => ({
      id: lr.id,
      source: "Completed Industry Learning",
      title: lr.learningResource.title,
      type: lr.learningResource.type,
      date: lr.completedAt,
      verificationStatus: VerificationStatus.VERIFIED, // Completed on platform is verifiable
      description: lr.learningResource.description
    })),
    
    // Add manually added portfolio items
    ...user.portfolioItems.map((pi: any) => ({
      id: pi.id,
      source: "Self-Reported Entry",
      title: pi.title,
      type: pi.type,
      date: pi.date,
      verificationStatus: pi.verificationStatus,
      description: pi.description,
      // If public, only expose document if its policy is public
      document: pi.document ? {
        id: pi.document.id,
        filename: pi.document.filename,
        isDownloadable: !isPublic || pi.document.accessPolicy === "public"
      } : null
    }))
  ];

  // Sort timeline descending by date
  aggregatedTimeline.sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });

  // Strip sensitive info
  return {
    studentName: user.name,
    department: user.studentProfile.department,
    academicYear: user.studentProfile.year,
    skills: user.studentProfile.studentSkills.map((s: any) => ({
      id: s.skillId,
      name: s.skill.name,
      category: s.skill.category,
      proficiency: s.proficiency,
      verificationStatus: s.verificationStatus,
      source: "Skill Matrix"
    })),
    timeline: aggregatedTimeline
  };
}
