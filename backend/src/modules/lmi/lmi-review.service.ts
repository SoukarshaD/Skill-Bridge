import { prisma } from '../../config/database';
import { LmiIntelligenceService } from './lmi-intelligence.service';
import { LmiAlignmentService } from './lmi-alignment.service';

const intelligenceService = new LmiIntelligenceService();
const alignmentService = new LmiAlignmentService();

export interface ReviewFilter {
  roleId?: string;
  location?: string;
}

export class LmiReviewService {
  
  /**
   * Calculates skill-level oversupply by comparing training coverage to observed demand.
   */
  async getSkillOversupply(filters: ReviewFilter = {}) {
    const gaps = await intelligenceService.calculateSkillGaps(filters);
    
    const results = [];

    for (const gap of gaps) {
      const { skillId, skillName, demandScore, supplyScore, demandSignalCount, supplyProgramCount } = gap;
      
      const ratio = supplyScore / Math.max(demandScore, 1.0);
      
      let flag = 'BALANCED';
      let severity = 'NONE';
      let confidence = 'LOW';
      
      // Minimum evidence requirement
      if (demandSignalCount + supplyProgramCount < 3) {
        flag = 'INSUFFICIENT_DATA';
        confidence = 'LOW';
      } else if (ratio >= 3.0 && supplyScore >= 3.0) {
        flag = 'POTENTIAL_OVERSUPPLY';
        severity = ratio >= 5.0 ? 'HIGH' : 'MEDIUM';
        confidence = supplyProgramCount >= 5 ? 'HIGH' : 'MEDIUM';
      } else if (ratio <= 0.33 && demandScore >= 3.0) {
        flag = 'POTENTIAL_UNDERSUPPLY';
        severity = ratio <= 0.1 ? 'HIGH' : 'MEDIUM';
        confidence = demandSignalCount >= 10 ? 'HIGH' : 'MEDIUM';
      } else {
        confidence = (demandSignalCount >= 10 && supplyProgramCount >= 5) ? 'HIGH' : 'MEDIUM';
      }

      results.push({
        skillId,
        skillName,
        demandScore,
        supplyScore,
        ratio: Math.round(ratio * 100) / 100,
        flag,
        severity,
        confidence,
        explanation: this.getSkillExplanation(flag, skillName)
      });
    }

    return results.sort((a, b) => b.ratio - a.ratio);
  }

  private getSkillExplanation(flag: string, name: string) {
    switch(flag) {
      case 'POTENTIAL_OVERSUPPLY': return `Training coverage for ${name} significantly exceeds currently observed platform demand.`;
      case 'POTENTIAL_UNDERSUPPLY': return `High observed market demand for ${name} lacks proportional training coverage.`;
      case 'INSUFFICIENT_DATA': return `Not enough signals to confidently assess oversupply for ${name}.`;
      default: return `Supply and demand appear relatively proportional for ${name}.`;
    }
  }

  /**
   * Evaluates a single program for review flags (Oversupply, Obsolescence)
   */
  async getProgramReviewFlags(programId: string, filters: ReviewFilter = {}) {
    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: { requiredSkills: true }
    });

    if (!program) throw new Error("Program not found");
    if (program.status !== 'PUBLISHED') throw new Error("Program must be PUBLISHED for review");

    // 1. Get Phase 12 Alignment
    const alignment = await alignmentService.getProgramAlignment(programId, filters);
    
    // 2. Get Phase 11 skill gaps for context
    const gaps = await intelligenceService.calculateSkillGaps(filters);

    let aggDemand = 0;
    let aggSupply = 0;
    const skillIds = program.requiredSkills.map(s => s.skillId);
    
    for (const sid of skillIds) {
      const g = gaps.find(x => x.skillId === sid);
      if (g) {
        aggDemand += g.demandScore;
        aggSupply += g.supplyScore;
      }
    }

    // 3. Calculate Trend for program skills
    const trendData = await this.calculateTrend(skillIds, filters.location, filters.roleId);

    // 4. Determine Flags
    const flags = [];

    // OVERSUPPLY CHECK
    const supplyDemandRatio = aggSupply / Math.max(aggDemand, 1.0);
    if (supplyDemandRatio >= 3.0 && aggSupply >= 3.0) {
      flags.push({
        flagType: 'POTENTIAL_OVERSUPPLY',
        severity: supplyDemandRatio >= 5.0 ? 'HIGH' : 'MEDIUM',
        confidence: aggSupply >= 5 ? 'HIGH' : 'MEDIUM',
        explanation: 'Training coverage for mapped skills substantially exceeds currently observed platform demand.',
        recommendedAction: 'Review curriculum mapping and consider if capacity matches market reality.',
        evidence: {
          demandScore: Math.round(aggDemand * 10) / 10,
          supplyScore: Math.round(aggSupply * 10) / 10,
          ratio: Math.round(supplyDemandRatio * 10) / 10
        }
      });
    }

    // OBSOLESCENCE / CURRICULUM REVIEW CHECK
    const isWeakAlignment = alignment.alignmentScore < 30;
    const isLowDemand = aggDemand < 3.0;
    
    if (isWeakAlignment && isLowDemand) {
       if (trendData.trend === 'DECLINING') {
          flags.push({
            flagType: 'POTENTIAL_OBSOLESCENCE',
            severity: 'HIGH',
            confidence: trendData.confidence,
            explanation: 'Program has very weak alignment with current market needs AND historical data shows declining demand for its core skills.',
            recommendedAction: 'Consider a comprehensive curriculum review or archival if not mandated by other strategic policies.',
            evidence: {
              alignmentScore: alignment.alignmentScore,
              demandTrend: trendData.trend,
              recentDemand: trendData.recentScore,
              historicalDemand: trendData.historicalScore
            }
          });
       } else if (trendData.trend === 'INSUFFICIENT_DATA') {
          flags.push({
            flagType: 'CURRICULUM_REVIEW',
            severity: 'MEDIUM',
            confidence: 'LOW',
            explanation: 'Program has weak alignment and low current demand, but historical evidence is insufficient to declare a declining trend.',
            recommendedAction: 'Monitor program performance and evaluate curriculum relevance.',
            evidence: {
              alignmentScore: alignment.alignmentScore,
              demandTrend: trendData.trend,
              recentDemand: trendData.recentScore,
              historicalDemand: trendData.historicalScore
            }
          });
       }
    }

    if (flags.length === 0) {
      flags.push({
        flagType: 'BALANCED',
        severity: 'NONE',
        confidence: 'MEDIUM',
        explanation: 'No critical review flags identified based on current evidence.',
        recommendedAction: 'Maintain current operations.',
        evidence: {
           alignmentScore: alignment.alignmentScore,
           demandScore: Math.round(aggDemand * 10) / 10,
           supplyScore: Math.round(aggSupply * 10) / 10,
           demandTrend: trendData.trend
        }
      });
    }

    return {
      programId: program.id,
      programName: program.title,
      flags,
      trendData,
      methodology: {
        note: 'These are platform-derived review signals, not definitive determinations that a course is obsolete.',
        oversupply: 'Ratio of aggregate supply score to aggregate demand score >= 3.0',
        obsolescence: 'Weak alignment (<30%) + Low current demand (<3.0) + Declining historical trend',
        insufficientData: 'Insufficient historical evidence results in INSUFFICIENT_DATA rather than an inferred trend.'
      }
    };
  }

  /**
   * Evaluates all programs
   */
  async getAllProgramReviewFlags(filters: ReviewFilter = {}) {
    const programs = await prisma.program.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true }
    });

    const results = [];
    for (const p of programs) {
      // In a heavy production system, this would be optimized to avoid N+1.
      // For MVP scale, sequential evaluation correctly leverages Phase 12 logic.
      const flags = await this.getProgramReviewFlags(p.id, filters);
      
      // Only include programs with actual warning flags in bulk view
      const activeFlags = flags.flags.filter(f => f.flagType !== 'BALANCED');
      if (activeFlags.length > 0) {
        results.push({
          programId: flags.programId,
          programName: flags.programName,
          flags: activeFlags
        });
      }
    }

    return results;
  }

  private async calculateTrend(skillIds: string[], location?: string, roleId?: string) {
    const now = new Date().getTime();
    const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
    const ONE_EIGHTY_DAYS_MS = 180 * 24 * 60 * 60 * 1000;

    const where: any = {
      status: 'PROCESSED',
      skills: { some: { skillId: { in: skillIds } } }
    };
    if (location) where.normalizedLocation = { contains: location, mode: 'insensitive' };
    if (roleId) where.roleId = roleId;

    const signals = await prisma.demandSignal.findMany({
      where,
      select: { observedAt: true, skills: { select: { skillId: true, confidence: true } } }
    });

    let recentScore = 0;
    let historicalScore = 0;

    for (const sig of signals) {
      const timeOld = now - new Date(sig.observedAt).getTime();
      const hasMatchedSkill = sig.skills.find(s => s.skillId && skillIds.includes(s.skillId));
      if (!hasMatchedSkill) continue;
      
      const conf = hasMatchedSkill.confidence ?? 1.0;

      if (timeOld <= NINETY_DAYS_MS) {
        recentScore += conf;
      } else if (timeOld <= ONE_EIGHTY_DAYS_MS) {
        historicalScore += conf;
      }
    }

    recentScore = Math.round(recentScore * 10) / 10;
    historicalScore = Math.round(historicalScore * 10) / 10;

    let trend = 'STABLE';
    let confidence = 'LOW';

    // Historical Evidence Requirement: Need at least 3.0 score in historical period to establish a baseline
    if (historicalScore < 3.0 && recentScore < 3.0) {
      trend = 'INSUFFICIENT_DATA';
    } else {
      confidence = historicalScore >= 10 ? 'HIGH' : 'MEDIUM';
      
      if (recentScore < (historicalScore * 0.5)) {
        trend = 'DECLINING';
      } else if (recentScore > (historicalScore * 1.5)) {
        trend = 'INCREASING';
      }
    }

    return {
      trend,
      confidence,
      recentScore,
      historicalScore
    };
  }
}
