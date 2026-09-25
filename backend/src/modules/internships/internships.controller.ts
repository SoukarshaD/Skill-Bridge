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
