import { Request, Response } from 'express';
import { CareerGuidanceService } from './career-guidance.service';

export class CareerGuidanceController {
  private service = new CareerGuidanceService();

  async getRoles(req: Request, res: Response) {
    try {
      const roles = await this.service.getRoles();
      res.json({ success: true, roles });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getRecommendations(req: Request, res: Response) {
    try {
      const recommendations = await this.service.getRecommendations(req.user!.id);
      res.json({ success: true, recommendations });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getRole(req: Request, res: Response) {
    try {
      const role = await this.service.getRole(String(req.params.id));
      if (!role) {
        return res.status(404).json({ success: false, message: 'Role not found' });
      }
      res.json({ success: true, role });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getRoleGaps(req: Request, res: Response) {
    try {
      const gaps = await this.service.getRoleGaps(String(req.params.id), req.user!.id);
      res.json({ success: true, ...gaps });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getCareerPathway(req: Request, res: Response) {
    try {
      const pathway = await this.service.getCareerPathway(String(req.params.roleId), req.user!.id);
      res.json({ success: true, pathway });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
