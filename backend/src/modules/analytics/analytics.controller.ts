import { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { OpportunityStatus } from "@prisma/client";
import { calculateMatchScore } from "../matching/matching.utils";

const READINESS_THRESHOLD = 70;

export const getPlacementFunnel = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const institutionId = req.user?.institutionId || req.user?.organizationId;
    if (!institutionId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Get all students for this institution
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        institutionId,
      },
      select: { id: true }
    });
    const studentIds = students.map(s => s.id);

    // Get all applications for these students
    const applications = await prisma.application.findMany({
      where: {
        studentId: { in: studentIds }
      },
      include: {
        statusHistory: true
      }
    });

    const funnel = {
      APPLIED: 0,
      SHORTLISTED: 0,
      INTERVIEW: 0,
      OFFERED: 0,
      ACCEPTED: 0
    };

    applications.forEach(app => {
      // Check if application has a history record for each stage, or if current status is >= that stage
      // The state machine generally goes APPLIED -> SHORTLISTED -> INTERVIEW -> OFFERED -> ACCEPTED
      const historyStatuses = app.statusHistory.map(h => h.newStatus);
      const allStatuses = new Set([app.status, ...historyStatuses]);

      if (allStatuses.has("APPLIED") || allStatuses.size > 0) funnel.APPLIED++;
      if (allStatuses.has("SHORTLISTED") || allStatuses.has("INTERVIEW") || allStatuses.has("OFFERED") || allStatuses.has("ACCEPTED") || allStatuses.has("DECLINED")) funnel.SHORTLISTED++;
      if (allStatuses.has("INTERVIEW") || allStatuses.has("OFFERED") || allStatuses.has("ACCEPTED") || allStatuses.has("DECLINED")) funnel.INTERVIEW++;
      if (allStatuses.has("OFFERED") || allStatuses.has("ACCEPTED") || allStatuses.has("DECLINED")) funnel.OFFERED++;
      if (allStatuses.has("ACCEPTED")) funnel.ACCEPTED++;
    });

    res.status(200).json(funnel);
  } catch (error) {
    next(error);
  }
};

export const getDepartmentOutcomes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const institutionId = req.user?.institutionId || req.user?.organizationId;
    if (!institutionId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Get all students with their department
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        institutionId,
      },
      include: {
        studentProfile: true,
        applications: {
          where: {
            status: { in: ["OFFERED", "ACCEPTED"] }
          }
        }
      }
    });

    const departmentMap: Record<string, { offered: number; accepted: number }> = {};

    students.forEach(student => {
      const dept = student.studentProfile?.department || "Unknown";
      if (!departmentMap[dept]) {
        departmentMap[dept] = { offered: 0, accepted: 0 };
      }

      student.applications.forEach(app => {
        if (app.status === "OFFERED") departmentMap[dept].offered++;
        if (app.status === "ACCEPTED") departmentMap[dept].accepted++;
      });
    });

    const outcomes = Object.keys(departmentMap).map(dept => ({
      department: dept,
      offered: departmentMap[dept].offered,
      accepted: departmentMap[dept].accepted
    }));

    res.status(200).json(outcomes);
  } catch (error) {
    next(error);
  }
};

export const getIndustryDemand = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { scope } = req.query; // "current" | "historical"
    
    let statuses: OpportunityStatus[] = ["PUBLISHED"];
    if (scope === "historical") {
      statuses = ["PUBLISHED", "CLOSED"];
    }

    // Get all OpportunitySkills for the targeted opportunities
    const opportunitySkills = await prisma.opportunitySkill.findMany({
      where: {
        opportunity: {
          status: { in: statuses }
        }
      },
      include: { skill: true }
    });

    const demandMap: Record<string, { skillName: string; count: number; avgRequiredProficiency: number; totalProficiency: number }> = {};

    opportunitySkills.forEach(os => {
      if (!demandMap[os.skillId]) {
        demandMap[os.skillId] = {
          skillName: os.skill.name,
          count: 0,
          avgRequiredProficiency: 0,
          totalProficiency: 0
        };
      }
      demandMap[os.skillId].count++;
      demandMap[os.skillId].totalProficiency += os.requiredProficiency;
    });

    const demand = Object.values(demandMap).map(d => ({
      skillName: d.skillName,
      count: d.count,
      avgRequiredProficiency: d.totalProficiency / d.count
    })).sort((a, b) => b.count - a.count);

    res.status(200).json(demand.slice(0, 10)); // Top 10
  } catch (error) {
    next(error);
  }
};

export const getSkillGaps = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const institutionId = req.user?.institutionId || req.user?.organizationId;
    if (!institutionId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // 1. Get Top 5 demanded skills globally (PUBLISHED)
    const opportunitySkills = await prisma.opportunitySkill.findMany({
      where: {
        opportunity: { status: "PUBLISHED" }
      },
      include: { skill: true }
    });

    const demandMap: Record<string, { skillName: string; count: number; totalReq: number; avgReq: number }> = {};
    opportunitySkills.forEach(os => {
      if (!demandMap[os.skillId]) {
        demandMap[os.skillId] = { skillName: os.skill.name, count: 0, totalReq: 0, avgReq: 0 };
      }
      demandMap[os.skillId].count++;
      demandMap[os.skillId].totalReq += os.requiredProficiency;
    });

    const topSkills = Object.keys(demandMap)
      .map(id => ({
        skillId: id,
        skillName: demandMap[id].skillName,
        count: demandMap[id].count,
        avgReq: demandMap[id].totalReq / demandMap[id].count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 2. Calculate Institution Average (Zero-filled)
    const students = await prisma.user.findMany({
      where: { role: "STUDENT", institutionId },
      include: {
        studentProfile: {
          include: { studentSkills: true }
        }
      }
    });

    const totalStudents = students.length;
    if (totalStudents === 0) {
      res.status(200).json(topSkills.map(s => ({
        skillName: s.skillName,
        required: s.avgReq,
        studentAvg: 0
      })));
      return;
    }

    const gaps = topSkills.map(ts => {
      let totalStudentProficiency = 0;

      students.forEach(student => {
        const studentSkill = student.studentProfile?.studentSkills.find(ss => ss.skillId === ts.skillId);
        if (studentSkill) {
          totalStudentProficiency += studentSkill.proficiency;
        }
        // Zero-fill implies we don't add anything if missing, but we still divide by totalStudents
      });

      return {
        skillName: ts.skillName,
        required: ts.avgReq,
        studentAvg: totalStudentProficiency / totalStudents
      };
    });

    res.status(200).json(gaps);
  } catch (error) {
    next(error);
  }
};

export const getReadinessStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const institutionId = req.user?.institutionId || req.user?.organizationId;
    if (!institutionId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const students = await prisma.user.findMany({
      where: { role: "STUDENT", institutionId },
      include: {
        documents: { where: { type: "RESUME" } },
        portfolioItems: true,
        studentProfile: {
          include: { studentSkills: true }
        }
      }
    });

    const totalStudents = students.length;
    if (totalStudents === 0) {
      res.status(200).json({ readinessPercentage: 0, totalStudents: 0, readyStudents: 0 });
      return;
    }

    // Fetch all active published opportunities to check match scores
    const activeOpportunities = await prisma.opportunity.findMany({
      where: { status: "PUBLISHED" },
      include: {
        requiredSkills: true
      }
    });

    let readyCount = 0;

    for (const student of students) {
      const hasResume = student.documents.length > 0;
      const hasPortfolio = student.portfolioItems.length > 0;
      const has3Skills = (student.studentProfile?.studentSkills.length || 0) >= 3;

      if (!hasResume || !hasPortfolio || !has3Skills) {
        continue;
      }

      // Check if student has at least one eligible opportunity match score >= READINESS_THRESHOLD
      let isReady = false;
      const studentSkills = student.studentProfile?.studentSkills || [];

      for (const opp of activeOpportunities) {
        // Evaluate eligibility based on department and year, similar to matching engine
        if (opp.eligibility) {
          const el = opp.eligibility as { departments?: string[]; minYear?: number };
          if (el.departments && el.departments.length > 0) {
            const stuDept = student.studentProfile?.department;
            if (!stuDept || !el.departments.includes(stuDept)) continue;
          }
          if (el.minYear) {
            const stuYear = student.studentProfile?.year;
            if (!stuYear || stuYear < el.minYear) continue;
          }
        }

        const scoreObj = calculateMatchScore(studentSkills, opp.requiredSkills);
        if (scoreObj && scoreObj.overallMatchPercentage && scoreObj.overallMatchPercentage >= READINESS_THRESHOLD) {
          isReady = true;
          break; // Optimization: as soon as one is found, student is ready
        }
      }

      if (isReady) readyCount++;
    }

    res.status(200).json({
      readinessPercentage: (readyCount / totalStudents) * 100,
      totalStudents,
      readyStudents: readyCount
    });
  } catch (error) {
    next(error);
  }
};

export const getAcademicianParticipations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const institutionId = req.user?.institutionId || req.user?.organizationId;
    if (!institutionId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Get all academicians for this institution
    const academicians = await prisma.user.findMany({
      where: {
        role: "ACADEMICIAN",
        institutionId,
      },
      include: {
        academicProfile: true,
        collaborationsAsAcademician: true,
      }
    });

    const stats = {
      totalAcademicians: academicians.length,
      totalProposals: 0,
      activeCollaborations: 0,
      completedCollaborations: 0,
      fdpRegistrations: 0
    };

    const academicianIds = academicians.map(a => a.id);

    // Get all program registrations by academicians (FDPs, etc.)
    const programRegistrations = await prisma.programRegistration.count({
      where: {
        participantId: { in: academicianIds }
      }
    });
    stats.fdpRegistrations = programRegistrations;

    academicians.forEach(acad => {
      acad.collaborationsAsAcademician.forEach((collab: any) => {
        stats.totalProposals++;
        if (collab.status === 'ACTIVE') stats.activeCollaborations++;
        if (collab.status === 'COMPLETED') stats.completedCollaborations++;
      });
    });

    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};
