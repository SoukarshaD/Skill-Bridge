import { calculateMatchScore, isEligible } from '../modules/matching/matching.utils';
import { OpportunityType, WorkMode, OpportunityStatus } from '@prisma/client';

describe('Matching Utilities', () => {
  describe('calculateMatchScore', () => {
    it('returns null when no required skills are provided', () => {
      const result = calculateMatchScore([], []);
      expect(result.overallMatchPercentage).toBeNull();
      expect(result.matchedSkills).toHaveLength(0);
      expect(result.missingSkills).toHaveLength(0);
    });

    it('calculates 100% match when student has all skills at or above required proficiency', () => {
      const reqSkills = [
        { id: '1', opportunityId: 'o1', skillId: 's1', requiredProficiency: 3, weight: 1 },
        { id: '2', opportunityId: 'o1', skillId: 's2', requiredProficiency: 2, weight: 1 },
      ];
      const stuSkills = [
        { id: '1', studentProfileId: 'p1', skillId: 's1', proficiency: 4, verificationStatus: 'SELF_REPORTED' as any, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', studentProfileId: 'p1', skillId: 's2', proficiency: 2, verificationStatus: 'SELF_REPORTED' as any, createdAt: new Date(), updatedAt: new Date() },
      ];

      const result = calculateMatchScore(stuSkills, reqSkills);
      expect(result.overallMatchPercentage).toBe(100);
      expect(result.matchedSkills).toHaveLength(2);
      expect(result.missingSkills).toHaveLength(0);
    });

    it('correctly calculates partial matches based on min(student/req, 1) and weight', () => {
      const reqSkills = [
        { id: '1', opportunityId: 'o1', skillId: 's1', requiredProficiency: 4, weight: 2 }, // 50% * 2 = 1.0
        { id: '2', opportunityId: 'o1', skillId: 's2', requiredProficiency: 5, weight: 3 }, // 100% * 3 = 3.0
      ];
      const stuSkills = [
        { id: '1', studentProfileId: 'p1', skillId: 's1', proficiency: 2, verificationStatus: 'SELF_REPORTED' as any, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', studentProfileId: 'p1', skillId: 's2', proficiency: 5, verificationStatus: 'SELF_REPORTED' as any, createdAt: new Date(), updatedAt: new Date() },
      ];

      const result = calculateMatchScore(stuSkills, reqSkills);
      // total score = 4.0, total weight = 5.0 -> 80%
      expect(result.overallMatchPercentage).toBe(80);
      expect(result.matchedSkills).toHaveLength(1); // s2 matched perfectly
      expect(result.missingSkills).toHaveLength(1); // s1 has a gap
      expect(result.missingSkills[0].gapSeverity).toBe((4 - 2) * 2); // severity = 4
    });

    it('calculates 0% match when student has no matching skills', () => {
      const reqSkills = [
        { id: '1', opportunityId: 'o1', skillId: 's1', requiredProficiency: 4, weight: 1 },
      ];
      const stuSkills = [
        { id: '2', studentProfileId: 'p1', skillId: 's2', proficiency: 5, verificationStatus: 'SELF_REPORTED' as any, createdAt: new Date(), updatedAt: new Date() },
      ];

      const result = calculateMatchScore(stuSkills, reqSkills);
      expect(result.overallMatchPercentage).toBe(0);
      expect(result.matchedSkills).toHaveLength(0);
      expect(result.missingSkills).toHaveLength(1);
      expect(result.missingSkills[0].studentProficiency).toBe(0);
    });
  });

  describe('isEligible', () => {
    const opp = {
      id: 'o1',
      organizationId: 'org1',
      type: OpportunityType.JOB,
      title: 'Job',
      description: 'Desc',
      duration: null,
      compensation: null,
      location: null,
      workMode: WorkMode.ONSITE,
      deadline: null,
      status: OpportunityStatus.PUBLISHED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('returns true if opportunity has no eligibility criteria', () => {
      expect(isEligible({ year: '4' }, { ...opp, eligibility: null })).toBe(true);
    });

    it('returns false if student year is less than minYear', () => {
      const eligibility = { minYear: 3 };
      expect(isEligible({ year: '2' }, { ...opp, eligibility })).toBe(false);
    });

    it('returns true if student year meets minYear', () => {
      const eligibility = { minYear: 3 };
      expect(isEligible({ year: '4' }, { ...opp, eligibility })).toBe(true);
    });

    it('returns false if student department is not in allowed departments', () => {
      const eligibility = { departments: ['Computer Science'] };
      expect(isEligible({ department: 'Mechanical Engineering' }, { ...opp, eligibility })).toBe(false);
    });
  });
});
