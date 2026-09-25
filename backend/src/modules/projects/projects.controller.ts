import { Request, Response } from 'express';
import { projectService } from './projects.service';
import { addProjectMilestoneSchema, updateProjectMilestoneSchema, updateProjectStatusSchema } from './projects.schema';

export class ProjectController {
  async getProjects(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const projects = await projectService.getProjects(user.id, user.role, user.organizationId);
      res.json(projects);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getProjectById(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const project = await projectService.getProjectById(req.params.id as string, user.id, user.role, user.organizationId);
      res.json(project);
    } catch (error: any) {
      res.status(error.message === 'Unauthorized' ? 403 : 404).json({ error: error.message });
    }
  }

  async startProject(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const project = await projectService.startProject(req.params.applicationId as string, user.id, user.role, user.organizationId);
      res.status(201).json(project);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const data = updateProjectStatusSchema.parse(req.body);
      const project = await projectService.updateStatus(req.params.id as string, data, user.id, user.role, user.organizationId);
      res.json(project);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  async addMilestone(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const data = addProjectMilestoneSchema.parse(req.body);
      const milestone = await projectService.addMilestone(req.params.id as string, data, user.id, user.role, user.organizationId);
      res.status(201).json(milestone);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  async updateMilestone(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const data = updateProjectMilestoneSchema.parse(req.body);
      const milestone = await projectService.updateMilestone(req.params.id as string, req.params.milestoneId as string, data, user.id, user.role, user.organizationId);
      res.json(milestone);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }
}
