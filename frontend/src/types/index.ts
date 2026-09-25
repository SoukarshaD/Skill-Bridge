// ─── Shared Types ───
// Frontend type definitions matching the database entities.
// These are used for API responses and UI rendering.

export type Role = "STUDENT" | "ACADEMICIAN" | "INDUSTRY" | "ADMIN";

export type OpportunityType =
  | "INTERNSHIP"
  | "APPRENTICESHIP"
  | "JOB"
  | "FACULTY_INTERNSHIP"
  | "INDUSTRIAL_TRAINING"
  | "FDP"
  | "CONSULTANCY"
  | "RESEARCH_COLLABORATION";

export type OpportunityStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "EXPIRED";

export type ApplicationStatus =
  | "APPLIED"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "OFFERED"
  | "REJECTED"
  | "WITHDRAWN";

export type WorkMode = "REMOTE" | "ONSITE" | "HYBRID";

export type VerificationStatus =
  | "SELF_REPORTED"
  | "PENDING"
  | "VERIFIED"
  | "REJECTED";

export type DocumentType =
  | "RESUME"
  | "CERTIFICATE"
  | "INTERNSHIP_LETTER"
  | "ACADEMIC_RECORD"
  | "OTHER";

// ─── Entity Types ───

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  institutionId?: string;
  organizationId?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  type: "INDUSTRY" | "INSTITUTION";
  name: string;
  domain?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  department?: string;
  year?: number;
  targetRoles: string[];
  interests: string[];
  skillVector?: Record<string, number>;
}

export interface AcademicProfile {
  id: string;
  userId: string;
  institution?: string;
  department?: string;
  expertise: string[];
  researchAreas: string[];
  consultancyAreas: string[];
}

export interface SkillTaxonomy {
  id: string;
  name: string;
  normalizedName: string;
  category: string;
  domain: string;
  relatedRoles: string[];
}

export interface Opportunity {
  id: string;
  organizationId: string;
  type: OpportunityType;
  title: string;
  description: string;
  requiredSkills: RequiredSkill[];
  eligibility?: Record<string, unknown>;
  duration?: string;
  compensation?: string;
  location?: string;
  workMode: WorkMode;
  deadline?: string;
  status: OpportunityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RequiredSkill {
  skillId: string;
  skillName: string;
  weight: number;
}

export interface Application {
  id: string;
  opportunityId: string;
  studentId: string;
  status: ApplicationStatus;
  resumeDocumentId?: string;
  portfolioUrl?: string;
  appliedAt: string;
  updatedAt: string;
}

export interface PortfolioItem {
  id: string;
  studentId: string;
  type: string;
  title: string;
  description?: string;
  date?: string;
  documentId?: string;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface LearningResource {
  id: string;
  title: string;
  provider?: string;
  skills: string[];
  description?: string;
  url?: string;
  duration?: string;
  type?: string;
}

// ─── API Response Types ───

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface MatchResult {
  overallMatch: number;
  matchedSkills: string[];
  partiallyMatchedSkills: string[];
  missingSkills: string[];
  learningRecommendations: LearningResource[];
}
