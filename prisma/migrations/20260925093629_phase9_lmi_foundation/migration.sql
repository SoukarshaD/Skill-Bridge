/*
  Warnings:

  - You are about to drop the column `completedAt` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `domain` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `domain` on the `AssessmentQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `question` on the `AssessmentQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `AssessmentQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `AssessmentQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `assessmentId` on the `AssessmentResponse` table. All the data in the column will be lost.
  - You are about to drop the column `response` on the `AssessmentResponse` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `AssessmentResponse` table. All the data in the column will be lost.
  - Added the required column `title` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assessmentId` to the `AssessmentQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionText` to the `AssessmentQuestion` table without a default value. This is not possible if the table is not empty.
  - Made the column `options` on table `AssessmentQuestion` required. This step will fail if there are existing NULL values in that column.
  - Made the column `correctAnswer` on table `AssessmentQuestion` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `answer` to the `AssessmentResponse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `attemptId` to the `AssessmentResponse` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('TECHNICAL', 'SOFT_SKILL', 'APTITUDE');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "CollaborationStatus" AS ENUM ('PROPOSED', 'REVIEWING', 'ACCEPTED', 'REJECTED', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MentorshipProgramStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');

-- CreateEnum
CREATE TYPE "MentorshipStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "InternshipStatus" AS ENUM ('NOT_STARTED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ProgramType" AS ENUM ('WORKSHOP', 'FDP', 'GUEST_LECTURE', 'INDUSTRIAL_TRAINING');

-- CreateEnum
CREATE TYPE "ProgramStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ProgramMode" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('REGISTERED', 'ATTENDED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CertificateSourceType" AS ENUM ('LEARNING', 'PROGRAM', 'INTERNSHIP', 'MENTORSHIP', 'ASSESSMENT', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "CertificateVerificationMethod" AS ENUM ('SELF_REPORTED', 'INTERNAL_COMPLETION', 'ISSUER_VERIFIED', 'ADMIN_VERIFIED', 'EXTERNAL_LINK');

-- CreateEnum
CREATE TYPE "ChallengeSubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'SELECTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('NOT_STARTED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProjectMilestoneStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'SUBMITTED', 'REVIEWED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "DemandSourceType" AS ENUM ('JOB_POSTING', 'EMPLOYER_SURVEY', 'INDUSTRY_CONSULTATION', 'SECTOR_REPORT', 'PLACEMENT_OUTCOME', 'MANUAL_ENTRY');

-- CreateEnum
CREATE TYPE "DemandSignalStatus" AS ENUM ('RAW', 'PROCESSED', 'ARCHIVED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OpportunityType" ADD VALUE 'INNOVATION_CHALLENGE';
ALTER TYPE "OpportunityType" ADD VALUE 'LIVE_PROJECT';

-- DropForeignKey
ALTER TABLE "Assessment" DROP CONSTRAINT "Assessment_userId_fkey";

-- DropForeignKey
ALTER TABLE "AssessmentQuestion" DROP CONSTRAINT "AssessmentQuestion_skillId_fkey";

-- DropForeignKey
ALTER TABLE "AssessmentResponse" DROP CONSTRAINT "AssessmentResponse_assessmentId_fkey";

-- DropIndex
DROP INDEX "Assessment_userId_idx";

-- DropIndex
DROP INDEX "AssessmentQuestion_domain_idx";

-- DropIndex
DROP INDEX "AssessmentResponse_assessmentId_idx";

-- AlterTable
ALTER TABLE "Assessment" DROP COLUMN "completedAt",
DROP COLUMN "domain",
DROP COLUMN "score",
DROP COLUMN "startedAt",
DROP COLUMN "userId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "durationMinutes" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "type" "AssessmentType" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "AssessmentQuestion" DROP COLUMN "domain",
DROP COLUMN "question",
DROP COLUMN "type",
DROP COLUMN "weight",
ADD COLUMN     "assessmentId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "explanation" TEXT,
ADD COLUMN     "marks" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "questionText" TEXT NOT NULL,
ADD COLUMN     "questionType" "QuestionType" NOT NULL DEFAULT 'MCQ',
ALTER COLUMN "skillId" DROP NOT NULL,
ALTER COLUMN "options" SET NOT NULL,
ALTER COLUMN "correctAnswer" SET NOT NULL;

-- AlterTable
ALTER TABLE "AssessmentResponse" DROP COLUMN "assessmentId",
DROP COLUMN "response",
DROP COLUMN "score",
ADD COLUMN     "answer" TEXT NOT NULL,
ADD COLUMN     "attemptId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isCorrect" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "marksAwarded" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE "Opportunity" ADD COLUMN     "certificateAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "evaluationCriteria" TEXT,
ADD COLUMN     "maxTeamSize" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "minTeamSize" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "prizes" TEXT,
ADD COLUMN     "rules" TEXT;

-- AlterTable
ALTER TABLE "PortfolioItem" ADD COLUMN     "certificateId" TEXT;

-- CreateTable
CREATE TABLE "CareerRole" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerRoleSkill" (
    "id" TEXT NOT NULL,
    "careerRoleId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "requiredProficiency" INTEGER NOT NULL DEFAULT 3,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "importance" TEXT NOT NULL DEFAULT 'CORE',

    CONSTRAINT "CareerRoleSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentAttempt" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "score" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION,
    "percentage" DOUBLE PRECISION,
    "status" "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collaboration" (
    "id" TEXT NOT NULL,
    "academicianId" TEXT NOT NULL,
    "industryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "OpportunityType" NOT NULL,
    "expertise" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "expectedOutcomes" TEXT,
    "duration" TEXT,
    "documentId" TEXT,
    "status" "CollaborationStatus" NOT NULL DEFAULT 'PROPOSED',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collaboration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorshipProgram" (
    "id" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "maxMentees" INTEGER NOT NULL DEFAULT 1,
    "expertise" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "MentorshipProgramStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MentorshipProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mentorship" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "objectives" TEXT NOT NULL,
    "status" "MentorshipStatus" NOT NULL DEFAULT 'PENDING',
    "mentorFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mentorship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorshipGoal" (
    "id" TEXT NOT NULL,
    "mentorshipId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MentorshipGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorshipSession" (
    "id" TEXT NOT NULL,
    "mentorshipId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT NOT NULL,
    "nextSteps" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentorshipSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Internship" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "status" "InternshipStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startDate" TIMESTAMP(3),
    "expectedEndDate" TIMESTAMP(3),
    "actualEndDate" TIMESTAMP(3),
    "completionSummary" TEXT,
    "mentorFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Internship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternshipMilestone" (
    "id" TEXT NOT NULL,
    "internshipId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "MilestoneStatus" NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternshipMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternshipProgressUpdate" (
    "id" TEXT NOT NULL,
    "internshipId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternshipProgressUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ProgramType" NOT NULL,
    "organizationId" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "eligibility" JSONB,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "duration" TEXT,
    "mode" "ProgramMode" NOT NULL DEFAULT 'OFFLINE',
    "location" TEXT,
    "registrationDeadline" TIMESTAMP(3),
    "capacity" INTEGER,
    "certificateAvailable" BOOLEAN NOT NULL DEFAULT false,
    "status" "ProgramStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramSkill" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "requiredProficiency" INTEGER NOT NULL DEFAULT 1,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "ProgramSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramRegistration" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'REGISTERED',
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completionDate" TIMESTAMP(3),
    "feedback" TEXT,

    CONSTRAINT "ProgramRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "description" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "credentialId" TEXT,
    "credentialUrl" TEXT,
    "documentId" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'SELF_REPORTED',
    "verificationMethod" "CertificateVerificationMethod" NOT NULL DEFAULT 'SELF_REPORTED',
    "sourceType" "CertificateSourceType" NOT NULL,
    "sourceId" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificateSkill" (
    "id" TEXT NOT NULL,
    "certificateId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "CertificateSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeTeam" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChallengeTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeTeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "isLeader" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeSubmission" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "studentId" TEXT,
    "teamId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "technicalApproach" TEXT,
    "repositoryUrl" TEXT,
    "demoUrl" TEXT,
    "documentId" TEXT,
    "status" "ChallengeSubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "score" DOUBLE PRECISION,
    "feedback" TEXT,
    "evaluatorId" TEXT,
    "submittedAt" TIMESTAMP(3),
    "evaluatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChallengeSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectWorkspace" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startDate" TIMESTAMP(3),
    "expectedEndDate" TIMESTAMP(3),
    "actualEndDate" TIMESTAMP(3),
    "completionSummary" TEXT,
    "mentorId" TEXT,
    "mentorFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectWorkspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMilestone" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "ProjectMilestoneStatus" NOT NULL DEFAULT 'PENDING',
    "deliverableUrl" TEXT,
    "deliverableDocumentId" TEXT,
    "feedback" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemandSignal" (
    "id" TEXT NOT NULL,
    "sourceType" "DemandSourceType" NOT NULL,
    "sourceReference" TEXT,
    "title" TEXT NOT NULL,
    "roleId" TEXT,
    "organizationId" TEXT,
    "location" TEXT,
    "description" TEXT,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "status" "DemandSignalStatus" NOT NULL DEFAULT 'RAW',
    "isSynthetic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemandSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemandSignalSkill" (
    "id" TEXT NOT NULL,
    "demandSignalId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "requiredProficiency" INTEGER,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "evidence" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemandSignalSkill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CareerRoleSkill_careerRoleId_idx" ON "CareerRoleSkill"("careerRoleId");

-- CreateIndex
CREATE INDEX "CareerRoleSkill_skillId_idx" ON "CareerRoleSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "CareerRoleSkill_careerRoleId_skillId_key" ON "CareerRoleSkill"("careerRoleId", "skillId");

-- CreateIndex
CREATE INDEX "AssessmentAttempt_assessmentId_idx" ON "AssessmentAttempt"("assessmentId");

-- CreateIndex
CREATE INDEX "AssessmentAttempt_studentId_idx" ON "AssessmentAttempt"("studentId");

-- CreateIndex
CREATE INDEX "Collaboration_academicianId_idx" ON "Collaboration"("academicianId");

-- CreateIndex
CREATE INDEX "Collaboration_industryId_idx" ON "Collaboration"("industryId");

-- CreateIndex
CREATE INDEX "Collaboration_status_idx" ON "Collaboration"("status");

-- CreateIndex
CREATE INDEX "MentorshipProgram_mentorId_idx" ON "MentorshipProgram"("mentorId");

-- CreateIndex
CREATE INDEX "MentorshipProgram_status_idx" ON "MentorshipProgram"("status");

-- CreateIndex
CREATE INDEX "Mentorship_studentId_idx" ON "Mentorship"("studentId");

-- CreateIndex
CREATE INDEX "Mentorship_status_idx" ON "Mentorship"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Mentorship_programId_studentId_key" ON "Mentorship"("programId", "studentId");

-- CreateIndex
CREATE INDEX "MentorshipGoal_mentorshipId_idx" ON "MentorshipGoal"("mentorshipId");

-- CreateIndex
CREATE INDEX "MentorshipSession_mentorshipId_idx" ON "MentorshipSession"("mentorshipId");

-- CreateIndex
CREATE UNIQUE INDEX "Internship_applicationId_key" ON "Internship"("applicationId");

-- CreateIndex
CREATE INDEX "Internship_studentId_idx" ON "Internship"("studentId");

-- CreateIndex
CREATE INDEX "Internship_organizationId_idx" ON "Internship"("organizationId");

-- CreateIndex
CREATE INDEX "Internship_status_idx" ON "Internship"("status");

-- CreateIndex
CREATE INDEX "InternshipMilestone_internshipId_idx" ON "InternshipMilestone"("internshipId");

-- CreateIndex
CREATE INDEX "InternshipProgressUpdate_internshipId_idx" ON "InternshipProgressUpdate"("internshipId");

-- CreateIndex
CREATE INDEX "InternshipProgressUpdate_authorId_idx" ON "InternshipProgressUpdate"("authorId");

-- CreateIndex
CREATE INDEX "Program_organizationId_idx" ON "Program"("organizationId");

-- CreateIndex
CREATE INDEX "Program_type_idx" ON "Program"("type");

-- CreateIndex
CREATE INDEX "Program_status_idx" ON "Program"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramSkill_programId_skillId_key" ON "ProgramSkill"("programId", "skillId");

-- CreateIndex
CREATE INDEX "ProgramRegistration_participantId_idx" ON "ProgramRegistration"("participantId");

-- CreateIndex
CREATE INDEX "ProgramRegistration_status_idx" ON "ProgramRegistration"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramRegistration_programId_participantId_key" ON "ProgramRegistration"("programId", "participantId");

-- CreateIndex
CREATE INDEX "Certificate_studentId_idx" ON "Certificate"("studentId");

-- CreateIndex
CREATE INDEX "Certificate_verificationStatus_idx" ON "Certificate"("verificationStatus");

-- CreateIndex
CREATE INDEX "Certificate_sourceType_idx" ON "Certificate"("sourceType");

-- CreateIndex
CREATE UNIQUE INDEX "CertificateSkill_certificateId_skillId_key" ON "CertificateSkill"("certificateId", "skillId");

-- CreateIndex
CREATE INDEX "ChallengeTeam_challengeId_idx" ON "ChallengeTeam"("challengeId");

-- CreateIndex
CREATE INDEX "ChallengeTeamMember_studentId_idx" ON "ChallengeTeamMember"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeTeamMember_teamId_studentId_key" ON "ChallengeTeamMember"("teamId", "studentId");

-- CreateIndex
CREATE INDEX "ChallengeSubmission_challengeId_idx" ON "ChallengeSubmission"("challengeId");

-- CreateIndex
CREATE INDEX "ChallengeSubmission_studentId_idx" ON "ChallengeSubmission"("studentId");

-- CreateIndex
CREATE INDEX "ChallengeSubmission_teamId_idx" ON "ChallengeSubmission"("teamId");

-- CreateIndex
CREATE INDEX "ChallengeSubmission_status_idx" ON "ChallengeSubmission"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectWorkspace_applicationId_key" ON "ProjectWorkspace"("applicationId");

-- CreateIndex
CREATE INDEX "ProjectWorkspace_studentId_idx" ON "ProjectWorkspace"("studentId");

-- CreateIndex
CREATE INDEX "ProjectWorkspace_organizationId_idx" ON "ProjectWorkspace"("organizationId");

-- CreateIndex
CREATE INDEX "ProjectWorkspace_opportunityId_idx" ON "ProjectWorkspace"("opportunityId");

-- CreateIndex
CREATE INDEX "ProjectWorkspace_status_idx" ON "ProjectWorkspace"("status");

-- CreateIndex
CREATE INDEX "ProjectMilestone_projectId_idx" ON "ProjectMilestone"("projectId");

-- CreateIndex
CREATE INDEX "DemandSignal_sourceType_idx" ON "DemandSignal"("sourceType");

-- CreateIndex
CREATE INDEX "DemandSignal_roleId_idx" ON "DemandSignal"("roleId");

-- CreateIndex
CREATE INDEX "DemandSignal_organizationId_idx" ON "DemandSignal"("organizationId");

-- CreateIndex
CREATE INDEX "DemandSignal_status_idx" ON "DemandSignal"("status");

-- CreateIndex
CREATE INDEX "DemandSignalSkill_skillId_idx" ON "DemandSignalSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "DemandSignalSkill_demandSignalId_skillId_key" ON "DemandSignalSkill"("demandSignalId", "skillId");

-- CreateIndex
CREATE INDEX "AssessmentQuestion_assessmentId_idx" ON "AssessmentQuestion"("assessmentId");

-- CreateIndex
CREATE INDEX "AssessmentResponse_attemptId_idx" ON "AssessmentResponse"("attemptId");

-- AddForeignKey
ALTER TABLE "CareerRoleSkill" ADD CONSTRAINT "CareerRoleSkill_careerRoleId_fkey" FOREIGN KEY ("careerRoleId") REFERENCES "CareerRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerRoleSkill" ADD CONSTRAINT "CareerRoleSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "SkillTaxonomy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentQuestion" ADD CONSTRAINT "AssessmentQuestion_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentQuestion" ADD CONSTRAINT "AssessmentQuestion_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "SkillTaxonomy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAttempt" ADD CONSTRAINT "AssessmentAttempt_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAttempt" ADD CONSTRAINT "AssessmentAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentResponse" ADD CONSTRAINT "AssessmentResponse_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "AssessmentAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioItem" ADD CONSTRAINT "PortfolioItem_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "Certificate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_academicianId_fkey" FOREIGN KEY ("academicianId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorshipProgram" ADD CONSTRAINT "MentorshipProgram_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mentorship" ADD CONSTRAINT "Mentorship_programId_fkey" FOREIGN KEY ("programId") REFERENCES "MentorshipProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mentorship" ADD CONSTRAINT "Mentorship_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorshipGoal" ADD CONSTRAINT "MentorshipGoal_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorshipSession" ADD CONSTRAINT "MentorshipSession_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Internship" ADD CONSTRAINT "Internship_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Internship" ADD CONSTRAINT "Internship_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Internship" ADD CONSTRAINT "Internship_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Internship" ADD CONSTRAINT "Internship_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternshipMilestone" ADD CONSTRAINT "InternshipMilestone_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES "Internship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternshipProgressUpdate" ADD CONSTRAINT "InternshipProgressUpdate_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES "Internship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternshipProgressUpdate" ADD CONSTRAINT "InternshipProgressUpdate_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramSkill" ADD CONSTRAINT "ProgramSkill_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramSkill" ADD CONSTRAINT "ProgramSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "SkillTaxonomy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramRegistration" ADD CONSTRAINT "ProgramRegistration_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramRegistration" ADD CONSTRAINT "ProgramRegistration_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateSkill" ADD CONSTRAINT "CertificateSkill_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "Certificate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateSkill" ADD CONSTRAINT "CertificateSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "SkillTaxonomy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeTeam" ADD CONSTRAINT "ChallengeTeam_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeTeamMember" ADD CONSTRAINT "ChallengeTeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "ChallengeTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeTeamMember" ADD CONSTRAINT "ChallengeTeamMember_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeSubmission" ADD CONSTRAINT "ChallengeSubmission_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeSubmission" ADD CONSTRAINT "ChallengeSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeSubmission" ADD CONSTRAINT "ChallengeSubmission_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "ChallengeTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeSubmission" ADD CONSTRAINT "ChallengeSubmission_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeSubmission" ADD CONSTRAINT "ChallengeSubmission_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectWorkspace" ADD CONSTRAINT "ProjectWorkspace_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectWorkspace" ADD CONSTRAINT "ProjectWorkspace_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectWorkspace" ADD CONSTRAINT "ProjectWorkspace_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectWorkspace" ADD CONSTRAINT "ProjectWorkspace_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectWorkspace" ADD CONSTRAINT "ProjectWorkspace_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMilestone" ADD CONSTRAINT "ProjectMilestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ProjectWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMilestone" ADD CONSTRAINT "ProjectMilestone_deliverableDocumentId_fkey" FOREIGN KEY ("deliverableDocumentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandSignal" ADD CONSTRAINT "DemandSignal_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "CareerRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandSignal" ADD CONSTRAINT "DemandSignal_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandSignalSkill" ADD CONSTRAINT "DemandSignalSkill_demandSignalId_fkey" FOREIGN KEY ("demandSignalId") REFERENCES "DemandSignal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandSignalSkill" ADD CONSTRAINT "DemandSignalSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "SkillTaxonomy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
