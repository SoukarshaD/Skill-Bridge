import { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { createSkillSchema, updateSkillSchema } from "./skills.schema";

export const getSkills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { domain, category } = req.query;

    const where: any = {};
    if (domain) where.domain = String(domain);
    if (category) where.category = String(category);

    const skills = await prisma.skillTaxonomy.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    res.status(200).json({ skills });
  } catch (error) {
    next(error);
  }
};

export const createSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = createSkillSchema.parse(req.body);
    const normalizedName = data.name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const existing = await prisma.skillTaxonomy.findUnique({
      where: { normalizedName }
    });

    if (existing) {
      res.status(409).json({ error: "Skill already exists" });
      return;
    }

    const skill = await prisma.skillTaxonomy.create({
      data: {
        ...data,
        normalizedName
      }
    });

    res.status(201).json({ skill });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
    } else {
      next(error);
    }
  }
};

export const updateSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const data = updateSkillSchema.parse(req.body);
    
    let normalizedName;
    if (data.name) {
      normalizedName = data.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const existing = await prisma.skillTaxonomy.findUnique({
        where: { normalizedName }
      });
      if (existing && existing.id !== id) {
        res.status(409).json({ error: "Skill with this name already exists" });
        return;
      }
    }

    const skill = await prisma.skillTaxonomy.update({
      where: { id: String(id) },
      data: {
        ...data,
        ...(normalizedName && { normalizedName })
      }
    });

    res.status(200).json({ skill });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: "Skill not found" });
    } else if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
    } else {
      next(error);
    }
  }
};

export const deleteSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // The restrict behavior means Prisma will throw P2003 if there are dependent StudentSkills.
    await prisma.skillTaxonomy.delete({
      where: { id: String(id) }
    });

    res.status(200).json({ message: "Skill deleted successfully" });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: "Skill not found" });
    } else if (error.code === 'P2003') {
      res.status(409).json({ error: "Cannot delete skill as it is currently in use by students or assessments." });
    } else {
      next(error);
    }
  }
};
