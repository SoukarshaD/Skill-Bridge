import { prisma } from '../../config/database';
import { LmiIntelligenceService } from './lmi-intelligence.service';
import { LmiReviewService } from './lmi-review.service';
import { LmiAlignmentService } from './lmi-alignment.service';

const intelligenceService = new LmiIntelligenceService();
const reviewService = new LmiReviewService();
const alignmentService = new LmiAlignmentService();

export class LmiDistrictService {
  /**
   * Generates a deterministic training plan for a specific district.
   */
  async getDistrictPlan(district: string) {
    if (!district) throw new Error("District is required");

    const normalizedDistrict = district.trim().toLowerCase();

    // 1. Calculate Skill Gaps for the District
    const skillGaps = await intelligenceService.calculateSkillGaps({ location: normalizedDistrict });

    let totalDemandSignals = 0;
    let totalTrainingPrograms = 0;

    const prioritySkills = [];
    const oversuppliedSkills = [];
    const prioritySkillIds = new Set<string>();

    for (const gap of skillGaps) {
      totalDemandSignals += gap.demandSignalCount;
      // We don't just sum supplyProgramCount here because a program might teach 5 skills,
      // and we don't want to overcount the program. We will count unique programs later.

      // Priority Calculation
      let priorityLevel = 'LOW';
      let priorityReason = 'Low gap or weak evidence';

      const totalEvidence = gap.demandSignalCount + gap.supplyProgramCount;

      if (totalEvidence < 2) {
        priorityLevel = 'INSUFFICIENT_DATA';
        priorityReason = 'Insufficient evidence to make a meaningful recommendation';
      } else if (gap.gapClassification === 'HIGH GAP') {
        if (gap.demandSignalCount >= 5) {
          priorityLevel = 'HIGH';
          priorityReason = 'High demand gap combined with strong local evidence';
        } else {
          priorityLevel = 'MEDIUM';
          priorityReason = 'High demand gap but limited local evidence volume';
        }
      } else if (gap.gapClassification === 'MODERATE GAP') {
         if (gap.demandSignalCount >= 3) {
           priorityLevel = 'MEDIUM';
           priorityReason = 'Moderate demand gap with sufficient evidence';
         }
      }

      if (priorityLevel === 'HIGH' || priorityLevel === 'MEDIUM') {
        prioritySkillIds.add(gap.skillId);
      }

      prioritySkills.push({
        skillId: gap.skillId,
        skillName: gap.skillName,
        demandScore: gap.demandScore,
        supplyScore: gap.supplyScore,
        gapScore: gap.gapScore,
        classification: gap.gapClassification,
        confidence: gap.confidence,
        demandSignalCount: gap.demandSignalCount,
        supplyProgramCount: gap.supplyProgramCount,
        priorityLevel,
        priorityReason
      });

      // Oversupply detection within the district (Phase 13 Integration)
      const ratio = gap.supplyScore / Math.max(gap.demandScore, 1.0);
      if (ratio >= 3.0 && gap.supplyScore >= 3.0) {
        oversuppliedSkills.push({
          skillId: gap.skillId,
          skillName: gap.skillName,
          ratio: Math.round(ratio * 10) / 10,
          flag: 'POTENTIAL_OVERSUPPLY',
          explanation: 'Observed training supply is significantly higher than platform-observed demand in this district.'
        });
      }
    }

    // 2. Count Unique Programs offering supply in this district (or ONLINE)
    const localPrograms = await prisma.program.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { location: { contains: normalizedDistrict, mode: 'insensitive' } },
          { mode: 'ONLINE' }
        ]
      },
      select: {
        id: true,
        title: true,
        requiredSkills: { select: { skillId: true } }
      }
    });

    totalTrainingPrograms = localPrograms.length;

    // 3. Recommended Programs
    // Identify local or online programs that cover the priority skills
    const recommendedPrograms = [];

    for (const prog of localPrograms) {
      const coveredPriorityIds = prog.requiredSkills
        .map(s => s.skillId)
        .filter(id => prioritySkillIds.has(id));

      if (coveredPriorityIds.length > 0) {
        const coveredNames = prioritySkills
          .filter(ps => coveredPriorityIds.includes(ps.skillId))
          .map(ps => ps.skillName);

        // Fetch alignment score dynamically
        const alignment = await alignmentService.getProgramAlignment(prog.id, { location: normalizedDistrict });

        recommendedPrograms.push({
          programId: prog.id,
          programTitle: prog.title,
          alignmentScore: alignment.alignmentScore,
          coveredPrioritySkills: coveredNames,
          priorityReason: `Program covers ${coveredPriorityIds.length} of the district's priority skills.`
        });
      }
    }

    // Sort priority skills by gapScore descending
    prioritySkills.sort((a, b) => b.gapScore - a.gapScore);

    // Sort recommended programs by alignment descending
    recommendedPrograms.sort((a, b) => b.alignmentScore - a.alignmentScore);

    // 4. Evidence Status
    let evidenceStatus = 'SUFFICIENT';
    if (totalDemandSignals < 3) {
      evidenceStatus = 'INSUFFICIENT_DATA';
    }

    return {
      district: district,
      generatedAt: new Date().toISOString(),
      evidenceStatus,
      totalDemandSignals,
      totalTrainingPrograms,
      prioritySkills,
      recommendedPrograms,
      oversuppliedSkills,
      methodology: {
        note: 'These indicators are calculated from platform-observed demand signals and training supply. They are not official labour-market statistics.',
        priority: 'Determined deterministically based on gap size and available signal volume.',
        oversupply: 'Ratio of supply to demand is 3x or higher.'
      }
    };
  }

  /**
   * Generates and saves a snapshot of the current district training plan (for auditability).
   */
  async saveDistrictPlanSnapshot(district: string) {
    const plan = await this.getDistrictPlan(district);
    
    const snapshot = await prisma.districtTrainingPlan.create({
      data: {
        district: plan.district,
        evidenceStatus: plan.evidenceStatus,
        totalDemandSignals: plan.totalDemandSignals,
        totalTrainingPrograms: plan.totalTrainingPrograms,
        prioritySkills: plan.prioritySkills,
        recommendedPrograms: plan.recommendedPrograms,
        oversuppliedSkills: plan.oversuppliedSkills,
        methodology: plan.methodology
      }
    });

    return snapshot;
  }

  /**
   * Retrieves the version history of training plans for a district.
   */
  async getDistrictPlanHistory(district: string) {
    return prisma.districtTrainingPlan.findMany({
      where: { district: district },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get a list of districts that have at least some demand signals
   */
  async getAvailableDistricts() {
    const signals = await prisma.demandSignal.findMany({
      where: { status: 'PROCESSED', normalizedLocation: { not: null } },
      select: { normalizedLocation: true },
      distinct: ['normalizedLocation']
    });

    return signals
      .map(s => s.normalizedLocation)
      .filter((loc): loc is string => loc !== null && loc.trim() !== '')
      .map(loc => {
        // Capitalize words
        return loc.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      });
  }
}
