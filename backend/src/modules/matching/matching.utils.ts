import { StudentSkill, OpportunitySkill, Opportunity } from '@prisma/client';

export interface MatchResult {
  overallMatchPercentage: number | null; // null means no required skills were provided
  matchedSkills: {
    skillId: string;
    name?: string;
    studentProficiency: number;
    requiredProficiency: number;
    weight: number;
  }[];
  missingSkills: {
    skillId: string;
    name?: string;
    studentProficiency: number; // 0 if missing
    requiredProficiency: number;
    weight: number;
    gapSeverity: number;
  }[];
}

/**
 * Calculates the match score for a student against an opportunity's required skills.
 */
export function calculateMatchScore(
  studentSkills: (StudentSkill & { skill?: { name: string } })[],
  requiredSkills: (OpportunitySkill & { skill?: { name: string } })[]
): MatchResult {
  if (!requiredSkills || requiredSkills.length === 0) {
    return {
      overallMatchPercentage: null,
      matchedSkills: [],
      missingSkills: []
    };
  }

  const result: MatchResult = {
    overallMatchPercentage: 0,
    matchedSkills: [],
    missingSkills: []
  };

  let totalWeight = 0;
  let totalScore = 0;

  for (const reqSkill of requiredSkills) {
    totalWeight += reqSkill.weight;

    const studentSkill = studentSkills.find((s) => s.skillId === reqSkill.skillId);
    const studentProficiency = studentSkill ? studentSkill.proficiency : 0;
    
    // skillMatch = min(studentProficiency / requiredProficiency, 1)
    const skillMatch = Math.min(studentProficiency / reqSkill.requiredProficiency, 1.0);
    
    totalScore += skillMatch * reqSkill.weight;

    const skillDetail = {
      skillId: reqSkill.skillId,
      name: reqSkill.skill?.name,
      studentProficiency,
      requiredProficiency: reqSkill.requiredProficiency,
      weight: reqSkill.weight,
    };

    if (studentProficiency >= reqSkill.requiredProficiency) {
      result.matchedSkills.push(skillDetail);
    } else {
      result.missingSkills.push({
        ...skillDetail,
        // gap severity: (req - student) * weight
        gapSeverity: (reqSkill.requiredProficiency - studentProficiency) * reqSkill.weight
      });
    }
  }

  if (totalWeight === 0) {
    // Edge case: weights sum to 0. Avoid division by zero.
    result.overallMatchPercentage = null;
  } else {
    // overallMatch = (Σ(skillMatch × weight) / Σ(weight)) × 100
    result.overallMatchPercentage = Math.round((totalScore / totalWeight) * 100);
  }

  // Sort missing skills by gap severity descending
  result.missingSkills.sort((a, b) => b.gapSeverity - a.gapSeverity);

  return result;
}

export function isEligible(
  studentProfile: any, // Need actual type
  opportunity: Opportunity
): boolean {
  // Simple eligibility logic based on JSON.
  if (!opportunity.eligibility) return true;

  const eligibility = opportunity.eligibility as any;
  if (!studentProfile) return false; // If no profile, they meet no custom filters

  if (eligibility.minYear && studentProfile.year) {
    const studentYear = parseInt(studentProfile.year);
    if (!isNaN(studentYear) && studentYear < eligibility.minYear) {
      return false;
    }
  }

  if (eligibility.departments && Array.isArray(eligibility.departments) && eligibility.departments.length > 0) {
    if (!studentProfile.department || !eligibility.departments.includes(studentProfile.department)) {
      return false;
    }
  }

  return true;
}
