import { prisma } from '../../config/database';

export interface SkillGapFilter {
  roleId?: string;
  location?: string;
  skillId?: string;
  gapClassification?: string;
}

export class LmiIntelligenceService {
  async calculateSkillGaps(filters: SkillGapFilter = {}) {
    const { roleId, location, skillId, gapClassification } = filters;

    // 1. Fetch all skills (or filtered)
    const skillsWhere = skillId ? { id: skillId } : {};
    const skills = await prisma.skillTaxonomy.findMany({
      where: skillsWhere,
      select: { id: true, name: true, category: true, domain: true }
    });

    // 2. Fetch Demand Signals (filtered by role, location)
    // We only want PROCESSED signals
    const demandWhere: any = { status: 'PROCESSED' };
    if (roleId) demandWhere.roleId = roleId;
    if (location) {
      demandWhere.normalizedLocation = { contains: location, mode: 'insensitive' };
    }

    const demandSignals = await prisma.demandSignal.findMany({
      where: demandWhere,
      select: {
        id: true,
        observedAt: true,
        skills: {
          select: {
            skillId: true,
            confidence: true
          }
        }
      }
    });

    // 3. Fetch Supply (Programs & Learning Resources)
    // Filter programs by location if applicable. If location is provided, we only count programs in that location OR ONLINE/global.
    const programWhere: any = { status: 'PUBLISHED' };
    if (location) {
      programWhere.OR = [
        { location: { contains: location, mode: 'insensitive' } },
        { mode: 'ONLINE' }
      ];
    }

    const programs = await prisma.program.findMany({
      where: programWhere,
      select: {
        id: true,
        location: true,
        mode: true,
        requiredSkills: { select: { skillId: true } }
      }
    });

    // Learning Resources are considered global for now, so they always count towards supply unless restricted by future logic.
    const resources = await prisma.learningResource.findMany({
      select: {
        id: true,
        learningResourceSkills: { select: { skillId: true } }
      }
    });

    // 4. Calculate for each skill
    const results = [];
    const now = new Date().getTime();

    for (const skill of skills) {
      // -- Demand Calculation --
      let demandScore = 0;
      let demandSignalCount = 0;

      for (const signal of demandSignals) {
        const hasSkill = signal.skills.find(s => s.skillId === skill.id);
        if (hasSkill) {
          demandSignalCount++;
          
          // Recency logic: signals within last 90 days get 1.0 weight, older get 0.5 weight.
          const daysOld = (now - new Date(signal.observedAt).getTime()) / (1000 * 60 * 60 * 24);
          const recencyWeight = daysOld <= 90 ? 1.0 : 0.5;
          
          const confidence = hasSkill.confidence ?? 1.0;
          demandScore += (confidence * recencyWeight);
        }
      }

      // -- Supply Calculation --
      let supplyProgramCount = 0;
      let supplyScore = 0;

      for (const prog of programs) {
        if (prog.requiredSkills.find(s => s.skillId === skill.id)) {
          supplyProgramCount++;
          supplyScore += 1.0;
        }
      }

      for (const res of resources) {
        if (res.learningResourceSkills.find(s => s.skillId === skill.id)) {
          supplyProgramCount++; // We bundle resources into "program count" representing total training vehicles
          supplyScore += 0.5; // Weight resources slightly less than full programs for MVP
        }
      }

      // -- Gap Formula --
      // Round scores for cleaner output
      demandScore = Math.round(demandScore * 10) / 10;
      supplyScore = Math.round(supplyScore * 10) / 10;
      const gapScore = Math.round((demandScore - supplyScore) * 10) / 10;

      let classification = 'BALANCED';
      if (gapScore >= 10) classification = 'HIGH GAP';
      else if (gapScore >= 5) classification = 'MODERATE GAP';
      else if (gapScore <= -5) classification = 'HIGH SUPPLY';

      let confLevel = 'LOW';
      if (demandSignalCount >= 10) confLevel = 'HIGH';
      else if (demandSignalCount >= 3) confLevel = 'MEDIUM';

      // Skip if no demand and no supply (optional, to keep response clean)
      if (demandSignalCount === 0 && supplyProgramCount === 0 && !skillId) {
        continue;
      }

      const gapData = {
        skillId: skill.id,
        skillName: skill.name,
        category: skill.category,
        domain: skill.domain,
        demandScore,
        demandSignalCount,
        supplyScore,
        supplyProgramCount,
        gapScore,
        gapClassification: classification,
        confidence: confLevel,
        roleId: roleId || null,
        location: location || 'GLOBAL / UNSPECIFIED',
        methodology: {
           demand: "Sum of normalized signal confidence * recency weight (1.0 if <=90 days old, else 0.5)",
           supply: "Programs (+1.0) + Learning Resources (+0.5) covering the canonical skill",
           gap: "demandScore - supplyScore"
        }
      };

      if (!gapClassification || gapClassification === classification) {
        results.push(gapData);
      }
    }

    // Sort by highest gap by default
    results.sort((a, b) => b.gapScore - a.gapScore);

    return results;
  }
}
