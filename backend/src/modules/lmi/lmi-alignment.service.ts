import { prisma } from '../../config/database';
import { LmiIntelligenceService, SkillGapFilter } from './lmi-intelligence.service';

const intelligenceService = new LmiIntelligenceService();

export interface ProgramAlignmentFilter {
  roleId?: string;
  location?: string;
}

export class LmiAlignmentService {
  
  /**
   * Calculates how well a specific program aligns with industry demand,
   * optionally contextualized by a specific role and location.
   */
  async getProgramAlignment(programId: string, filters: ProgramAlignmentFilter = {}) {
    const { roleId, location } = filters;

    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        requiredSkills: { include: { skill: true } }
      }
    });

    if (!program) {
      throw new Error("Program not found");
    }

    // 1. Get Phase 11 Intelligence (Demand vs Supply)
    const skillGaps = await intelligenceService.calculateSkillGaps({ roleId, location });

    // 2. Define the "Universe of Required Skills"
    // If roleId is provided, the universe is all CareerRoleSkills + any dynamically demanded skills for that role.
    // If no roleId is provided, the universe is just the Top 20 highest-demanded skills overall (to act as a baseline "market alignment").
    let requiredSkillsMap = new Map<string, any>();

    if (roleId) {
      const roleSkills = await prisma.careerRoleSkill.findMany({
        where: { careerRoleId: roleId },
        include: { skill: true }
      });
      for (const rs of roleSkills) {
        requiredSkillsMap.set(rs.skillId, {
          skillId: rs.skillId,
          skillName: rs.skill.name,
          isBaselineRoleSkill: true,
          demandScore: 1.0 // Base weight for static role skills
        });
      }
    }

    // Overlay Dynamic Demand from Phase 11
    let demandCount = 0;
    for (const gap of skillGaps) {
      if (gap.demandScore > 0 || (roleId && requiredSkillsMap.has(gap.skillId))) {
        if (roleId && !requiredSkillsMap.has(gap.skillId) && gap.demandScore > 0) {
           // It's dynamically demanded for this role, add it
           requiredSkillsMap.set(gap.skillId, {
             skillId: gap.skillId,
             skillName: gap.skillName,
             isBaselineRoleSkill: false,
             demandScore: gap.demandScore
           });
        } else if (requiredSkillsMap.has(gap.skillId)) {
           // Update score
           const existing = requiredSkillsMap.get(gap.skillId);
           existing.demandScore = Math.max(existing.demandScore, gap.demandScore);
        } else if (!roleId) {
           // No role filter: take top demanded skills as the universe
           if (demandCount < 20) {
             requiredSkillsMap.set(gap.skillId, {
               skillId: gap.skillId,
               skillName: gap.skillName,
               isBaselineRoleSkill: false,
               demandScore: gap.demandScore
             });
             demandCount++;
           }
        }
      }
    }

    // 3. Calculate Coverage
    let totalWeight = 0;
    let coveredWeight = 0;

    const coveredSkills = [];
    const missingSkills = [];
    
    // Skills the program teaches
    const programSkillIds = new Set(program.requiredSkills.map(ps => ps.skillId));

    for (const [skillId, reqSkill] of requiredSkillsMap.entries()) {
      totalWeight += reqSkill.demandScore;
      
      const gapInfo = skillGaps.find(g => g.skillId === skillId);
      
      if (programSkillIds.has(skillId)) {
        coveredWeight += reqSkill.demandScore;
        coveredSkills.push({
          skillId,
          skillName: reqSkill.skillName,
          demandScore: reqSkill.demandScore,
          gapScore: gapInfo ? gapInfo.gapScore : 0,
          gapClassification: gapInfo ? gapInfo.gapClassification : 'UNKNOWN'
        });
      } else {
        missingSkills.push({
          skillId,
          skillName: reqSkill.skillName,
          demandScore: reqSkill.demandScore,
          gapScore: gapInfo ? gapInfo.gapScore : 0,
          gapClassification: gapInfo ? gapInfo.gapClassification : 'UNKNOWN',
          reason: reqSkill.isBaselineRoleSkill 
            ? "Core requirement for targeted role" 
            : "High dynamic industry demand"
        });
      }
    }
    
    // Sort by demand score descending
    coveredSkills.sort((a, b) => b.demandScore - a.demandScore);
    missingSkills.sort((a, b) => b.demandScore - a.demandScore);

    const alignmentScore = totalWeight > 0 ? Math.round((coveredWeight / totalWeight) * 100) : 0;

    return {
      programId: program.id,
      programName: program.title,
      alignmentScore,
      totalRequiredSkills: requiredSkillsMap.size,
      coveredSkills,
      missingSkills,
      context: {
        roleId: roleId || null,
        location: location || 'GLOBAL / UNSPECIFIED'
      },
      methodology: {
        formula: "alignmentScore = (sum of demand score for covered skills) / (sum of demand score for all context skills) * 100",
        universe: roleId ? "CareerRole static skills + dynamic LMI demand for role" : "Top 20 highest demanded skills in specified location",
        source: "Phase 11 Demand Intelligence"
      }
    };
  }

  /**
   * For a given skill, finds which programs cover it and the overall demand/gap context.
   */
  async getSkillCoverage(skillId: string, filters: ProgramAlignmentFilter = {}) {
    const { location } = filters;

    // Get Phase 11 intelligence for this specific skill
    const gaps = await intelligenceService.calculateSkillGaps({ location, skillId });
    const gapInfo = gaps.find(g => g.skillId === skillId);

    const skill = await prisma.skillTaxonomy.findUnique({ where: { id: skillId } });
    if (!skill) throw new Error("Skill not found");

    // Fetch Programs that cover it
    const programWhere: any = { 
      status: 'PUBLISHED',
      requiredSkills: { some: { skillId } }
    };
    if (location) {
      programWhere.OR = [
        { location: { contains: location, mode: 'insensitive' } },
        { mode: 'ONLINE' }
      ];
    }

    const coveringPrograms = await prisma.program.findMany({
      where: programWhere,
      select: {
        id: true,
        title: true,
        mode: true,
        location: true
      }
    });

    return {
      skillId,
      skillName: skill.name,
      demandScore: gapInfo ? gapInfo.demandScore : 0,
      supplyScore: gapInfo ? gapInfo.supplyScore : 0,
      gapScore: gapInfo ? gapInfo.gapScore : 0,
      gapClassification: gapInfo ? gapInfo.gapClassification : 'UNKNOWN',
      coveringProgramsCount: coveringPrograms.length,
      coveringPrograms,
      methodology: {
        source: "Phase 11 Demand vs Supply Intelligence",
        coverage: "Count of PUBLISHED programs targeting this skill"
      }
    };
  }

  /**
   * Bulk evaluate all programs for a high-level alignment dashboard
   */
  async getAllProgramsAlignment(filters: ProgramAlignmentFilter = {}) {
    const programs = await prisma.program.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, title: true }
    });

    // To prevent N+1 overhead of fetching intelligence repeatedly, we can fetch it once
    // but the current implementation of `getProgramAlignment` is clean. 
    // We will call it sequentially or Promise.all (with a limit).
    // Given MVP scale, Promise.all is fine.
    
    // Opting for a slightly optimized route since getProgramAlignment calls calculateSkillGaps which is heavy.
    // Let's manually inline the bulk logic here to use ONE intelligence fetch.
    const { roleId, location } = filters;
    const skillGaps = await intelligenceService.calculateSkillGaps({ roleId, location });

    let requiredSkillsMap = new Map<string, any>();
    if (roleId) {
      const roleSkills = await prisma.careerRoleSkill.findMany({
        where: { careerRoleId: roleId },
        include: { skill: true }
      });
      for (const rs of roleSkills) {
        requiredSkillsMap.set(rs.skillId, {
          skillId: rs.skillId,
          demandScore: 1.0
        });
      }
    }

    let demandCount = 0;
    for (const gap of skillGaps) {
      if (gap.demandScore > 0 || (roleId && requiredSkillsMap.has(gap.skillId))) {
        if (roleId && !requiredSkillsMap.has(gap.skillId) && gap.demandScore > 0) {
           requiredSkillsMap.set(gap.skillId, { demandScore: gap.demandScore });
        } else if (requiredSkillsMap.has(gap.skillId)) {
           const existing = requiredSkillsMap.get(gap.skillId);
           existing.demandScore = Math.max(existing.demandScore, gap.demandScore);
        } else if (!roleId) {
           if (demandCount < 20) {
             requiredSkillsMap.set(gap.skillId, { demandScore: gap.demandScore });
             demandCount++;
           }
        }
      }
    }

    let totalWeight = 0;
    for (const reqSkill of requiredSkillsMap.values()) {
      totalWeight += reqSkill.demandScore;
    }

    const fullPrograms = await prisma.program.findMany({
      where: { status: 'PUBLISHED' },
      include: { requiredSkills: true }
    });

    const results = fullPrograms.map(prog => {
      let coveredWeight = 0;
      let missingHighGapCount = 0;
      const programSkillIds = new Set(prog.requiredSkills.map(ps => ps.skillId));

      for (const [skillId, reqSkill] of requiredSkillsMap.entries()) {
        if (programSkillIds.has(skillId)) {
          coveredWeight += reqSkill.demandScore;
        } else {
          // Check if it's a high gap skill
          const gapInfo = skillGaps.find(g => g.skillId === skillId);
          if (gapInfo && (gapInfo.gapClassification === 'HIGH GAP' || gapInfo.gapClassification === 'MODERATE GAP')) {
            missingHighGapCount++;
          }
        }
      }

      const alignmentScore = totalWeight > 0 ? Math.round((coveredWeight / totalWeight) * 100) : 0;

      return {
        programId: prog.id,
        programName: prog.title,
        alignmentScore,
        missingHighGapCount
      };
    });

    results.sort((a, b) => b.alignmentScore - a.alignmentScore);

    return results;
  }
}
