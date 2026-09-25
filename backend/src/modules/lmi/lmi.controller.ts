import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { createDemandSignalSchema, normalizePreviewSchema, employerValidationSchema, trainingOutcomeSchema } from './lmi.schema';
import { DemandSignalStatus, DemandSourceType, ValidationRelevance, OutcomeCategory } from '@prisma/client';
import { LmiNormalizationService } from './lmi.service';
import { LmiIntelligenceService } from './lmi-intelligence.service';
import { LmiAlignmentService } from './lmi-alignment.service';
import { LmiReviewService } from './lmi-review.service';
import { LmiDistrictService } from './lmi-district.service';
import { LmiFeedbackService } from './lmi-feedback.service';

const normalizationService = new LmiNormalizationService();
const intelligenceService = new LmiIntelligenceService();
const alignmentService = new LmiAlignmentService();
const reviewService = new LmiReviewService();
const districtService = new LmiDistrictService();
const feedbackService = new LmiFeedbackService();

export class LmiController {

  async getSkillGaps(req: Request, res: Response, next: NextFunction) {
    try {
      const { roleId, location, skillId, gapClassification } = req.query;
      
      const gaps = await intelligenceService.calculateSkillGaps({
        roleId: roleId as string,
        location: location as string,
        skillId: skillId as string,
        gapClassification: gapClassification as string
      });

      res.status(200).json({ success: true, skillGaps: gaps });
    } catch (error) {
      next(error);
    }
  }

  async getAllProgramsAlignment(req: Request, res: Response, next: NextFunction) {
    try {
      const { roleId, location } = req.query;
      const alignments = await alignmentService.getAllProgramsAlignment({
        roleId: roleId as string,
        location: location as string
      });
      res.status(200).json({ success: true, alignments });
    } catch (error) {
      next(error);
    }
  }

  async getProgramAlignment(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId } = req.params;
      const { roleId, location } = req.query;
      const alignment = await alignmentService.getProgramAlignment(programId as string, {
        roleId: roleId as string,
        location: location as string
      });
      res.status(200).json({ success: true, alignment });
    } catch (error) {
      next(error);
    }
  }

  async getSkillCoverage(req: Request, res: Response, next: NextFunction) {
    try {
      const { skillId } = req.params;
      const { location } = req.query;
      const coverage = await alignmentService.getSkillCoverage(skillId as string, {
        location: location as string
      });
      res.status(200).json({ success: true, coverage });
    } catch (error) {
      next(error);
    }
  }

  async getSkillOversupply(req: Request, res: Response, next: NextFunction) {
    try {
      const { location } = req.query;
      const oversupply = await reviewService.getSkillOversupply({
        location: location as string
      });
      res.status(200).json({ success: true, oversupply });
    } catch (error) {
      next(error);
    }
  }

  async getProgramReviewFlags(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId } = req.params;
      const { roleId, location } = req.query;
      const review = await reviewService.getProgramReviewFlags(programId as string, {
        roleId: roleId as string,
        location: location as string
      });
      res.status(200).json({ success: true, review });
    } catch (error) {
      next(error);
    }
  }

  async getAllProgramReviewFlags(req: Request, res: Response, next: NextFunction) {
    try {
      const { roleId, location } = req.query;
      const reviews = await reviewService.getAllProgramReviewFlags({
        roleId: roleId as string,
        location: location as string
      });
      res.status(200).json({ success: true, reviews });
    } catch (error) {
      next(error);
    }
  }

  async getDistrictPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const { district } = req.params;
      const plan = await districtService.getDistrictPlan(district as string);
      res.status(200).json({ success: true, plan });
    } catch (error) {
      next(error);
    }
  }

  async getAvailableDistricts(req: Request, res: Response, next: NextFunction) {
    try {
      const districts = await districtService.getAvailableDistricts();
      res.status(200).json({ success: true, districts });
    } catch (error) {
      next(error);
    }
  }

  async saveDistrictPlanSnapshot(req: Request, res: Response, next: NextFunction) {
    try {
      const { district } = req.params;
      const snapshot = await districtService.saveDistrictPlanSnapshot(district as string);
      res.status(201).json({ success: true, snapshot });
    } catch (error) {
      next(error);
    }
  }

  async getDistrictPlanHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { district } = req.params;
      const history = await districtService.getDistrictPlanHistory(district as string);
      res.status(200).json({ success: true, history });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // PHASE 15: EMPLOYER VALIDATION & OUTCOMES
  // ==========================================

  async submitEmployerValidation(req: Request, res: Response, next: NextFunction) {
    try {
      const data = employerValidationSchema.parse(req.body);

      if (!req.user?.organizationId) {
        return res.status(403).json({ success: false, error: 'User must belong to an organization' });
      }
      
      const validation = await feedbackService.submitEmployerValidation({
        ...data,
        relevance: data.relevance as ValidationRelevance,
        organizationId: req.user.organizationId,
        userId: req.user.id
      });
      res.status(201).json({ success: true, validation });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
      }
      next(error);
    }
  }

  async getSkillValidations(req: Request, res: Response, next: NextFunction) {
    try {
      const { skillId } = req.params;
      const data = await feedbackService.getSkillValidations(skillId as string);
      res.status(200).json({ success: true, ...data });
    } catch (error) {
      next(error);
    }
  }

  async getProgramValidations(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId } = req.params;
      const data = await feedbackService.getProgramValidations(programId as string);
      res.status(200).json({ success: true, ...data });
    } catch (error) {
      next(error);
    }
  }

  async submitOutcome(req: Request, res: Response, next: NextFunction) {
    try {
      const data = trainingOutcomeSchema.parse(req.body);
      const outcome = await feedbackService.submitOutcome({
        ...data,
        category: data.category as OutcomeCategory,
        programId: data.programId!,
        studentId: data.studentId!
      });
      res.status(201).json({ success: true, outcome });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
      }
      next(error);
    }
  }

  async getProgramOutcomes(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId } = req.params;
      const data = await feedbackService.getProgramOutcomes(programId as string);
      res.status(200).json({ success: true, ...data });
    } catch (error) {
      next(error);
    }
  }

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

  async normalizePreview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = normalizePreviewSchema.parse(req.body);
      
      const normalized = await normalizationService.normalizePreview(data as any);
      
      res.status(200).json({ success: true, preview: normalized });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
      } else {
        next(error);
      }
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

      // Step 11: Duplicate handling
      if (data.sourceReference && data.sourceType) {
         const existing = await prisma.demandSignal.findFirst({
            where: {
               sourceReference: data.sourceReference,
               sourceType: data.sourceType
            }
         });
         if (existing) {
            return res.status(409).json({ success: false, message: 'Duplicate demand signal (same source and reference)' });
         }
      }

      const signal = await prisma.demandSignal.create({
        data: {
          sourceType: data.sourceType,
          sourceReference: data.sourceReference,
          title: data.title,
          rawRoleTitle: data.rawRoleTitle,
          roleId: data.roleId,
          organizationId: data.organizationId,
          location: data.location,
          normalizedLocation: data.normalizedLocation,
          description: data.description,
          observedAt: new Date(data.observedAt),
          confidence: data.confidence,
          isSynthetic: data.isSynthetic,
          status: 'PROCESSED',
          skills: data.skills ? {
            create: data.skills.map(s => ({
              rawSkillName: s.rawSkillName,
              skillId: s.skillId,
              requiredProficiency: s.requiredProficiency,
              isMandatory: s.isMandatory !== undefined ? s.isMandatory : true,
              evidence: s.evidence,
              normalizationMethod: s.normalizationMethod,
              confidence: s.confidence
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
