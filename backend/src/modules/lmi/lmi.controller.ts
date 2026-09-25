import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { createDemandSignalSchema } from './lmi.schema';
import { DemandSignalStatus, DemandSourceType } from '@prisma/client';

export class LmiController {

  async getDemandSignals(req: Request, res: Response, next: NextFunction) {
    try {
      const { sourceType, isSynthetic, roleId, location, status } = req.query;

      const where: any = {};
      
      if (sourceType) where.sourceType = sourceType as DemandSourceType;
      if (isSynthetic !== undefined) where.isSynthetic = isSynthetic === 'true';
      if (roleId) where.roleId = String(roleId);
      if (location) where.location = { contains: String(location), mode: 'insensitive' };
      if (status) where.status = status as DemandSignalStatus;

      const signals = await prisma.demandSignal.findMany({
        where,
        include: {
          role: true,
          organization: true,
          skills: {
            include: { skill: true }
          }
        },
        orderBy: { observedAt: 'desc' }
      });

      res.status(200).json({ success: true, signals });
    } catch (error) {
      next(error);
    }
  }

  async getDemandSignal(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const signal = await prisma.demandSignal.findUnique({
        where: { id: String(id) },
        include: {
          role: true,
          organization: true,
          skills: {
            include: { skill: true }
          }
        }
      });

      if (!signal) {
        return res.status(404).json({ success: false, message: 'Demand signal not found' });
      }

      res.status(200).json({ success: true, signal });
    } catch (error) {
      next(error);
    }
  }

  async createDemandSignal(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createDemandSignalSchema.parse(req.body);

      // Verify associated models exist if provided
      if (data.roleId) {
        const role = await prisma.careerRole.findUnique({ where: { id: data.roleId } });
        if (!role) return res.status(400).json({ success: false, message: 'Invalid roleId' });
      }

      if (data.organizationId) {
        const org = await prisma.organization.findUnique({ where: { id: data.organizationId } });
        if (!org) return res.status(400).json({ success: false, message: 'Invalid organizationId' });
      }

      const signal = await prisma.demandSignal.create({
        data: {
          sourceType: data.sourceType,
          sourceReference: data.sourceReference,
          title: data.title,
          roleId: data.roleId,
          organizationId: data.organizationId,
          location: data.location,
          description: data.description,
          observedAt: new Date(data.observedAt),
          confidence: data.confidence,
          isSynthetic: data.isSynthetic,
          status: 'PROCESSED',
          skills: data.skills ? {
            create: data.skills.map(s => ({
              skillId: s.skillId,
              requiredProficiency: s.requiredProficiency,
              isMandatory: s.isMandatory !== undefined ? s.isMandatory : true,
              evidence: s.evidence
            }))
          } : undefined
        },
        include: {
          skills: {
            include: { skill: true }
          }
        }
      });

      res.status(201).json({ success: true, signal });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
      } else {
        next(error);
      }
    }
  }
}
