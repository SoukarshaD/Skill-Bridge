import { Request, Response } from 'express';
import { internshipService } from './internships.service';

export class InternshipController {
  async getInternships(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const internships = await internshipService.getInternships(user.id, user.role, user.organizationId);
      res.json(internships);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getInternshipById(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const internship = await internshipService.getInternshipById(req.params.id as string, user.id, user.role, user.organizationId);
      res.json(internship);
    } catch (error: any) {
      res.status(error.message === 'Unauthorized' ? 403 : 404).json({ error: error.message });
    }
  }

  async startInternship(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const internship = await internshipService.startInternship(req.params.applicationId as string, user.id, user.role, user.organizationId);
      res.status(201).json(internship);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { status } = req.body;
      const internship = await internshipService.updateStatus(req.params.id as string, status, user.id, user.role, user.organizationId);
      res.json(internship);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async addMilestone(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const milestone = await internshipService.addMilestone(req.params.id as string, req.body, user.id, user.role, user.organizationId);
      res.status(201).json(milestone);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateMilestone(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { status } = req.body;
      const milestone = await internshipService.updateMilestone(req.params.id as string, req.params.milestoneId as string, status, user.id, user.role, user.organizationId);
      res.json(milestone);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async addProgressUpdate(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { content } = req.body;
      const update = await internshipService.addProgressUpdate(req.params.id as string, content, user.id, user.role, user.organizationId);
      res.status(201).json(update);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async completeInternship(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const internship = await internshipService.completeInternship(req.params.id as string, req.body, user.id, user.role, user.organizationId);
      res.json(internship);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async addToPortfolio(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const portfolioItem = await internshipService.addToPortfolio(req.params.id as string, user.id);
      res.status(201).json(portfolioItem);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const internshipController = new InternshipController();
