-- CreateEnum
CREATE TYPE "ValidationRelevance" AS ENUM ('RELEVANT', 'LOW_RELEVANCE', 'EMERGING_IMPORTANCE');

-- CreateEnum
CREATE TYPE "OutcomeCategory" AS ENUM ('TRAINING_COMPLETED', 'EMPLOYMENT', 'APPRENTICESHIP', 'FURTHER_TRAINING', 'NOT_PLACED', 'UNKNOWN');

-- CreateTable
CREATE TABLE "EmployerValidation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skillId" TEXT,
    "programId" TEXT,
    "relevance" "ValidationRelevance" NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployerValidation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingOutcome" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "category" "OutcomeCategory" NOT NULL,
    "evidenceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmployerValidation_organizationId_idx" ON "EmployerValidation"("organizationId");

-- CreateIndex
CREATE INDEX "EmployerValidation_skillId_idx" ON "EmployerValidation"("skillId");

-- CreateIndex
CREATE INDEX "EmployerValidation_programId_idx" ON "EmployerValidation"("programId");

-- CreateIndex
CREATE INDEX "TrainingOutcome_programId_idx" ON "TrainingOutcome"("programId");

-- CreateIndex
CREATE INDEX "TrainingOutcome_studentId_idx" ON "TrainingOutcome"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingOutcome_programId_studentId_category_key" ON "TrainingOutcome"("programId", "studentId", "category");

-- AddForeignKey
ALTER TABLE "EmployerValidation" ADD CONSTRAINT "EmployerValidation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployerValidation" ADD CONSTRAINT "EmployerValidation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployerValidation" ADD CONSTRAINT "EmployerValidation_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "SkillTaxonomy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployerValidation" ADD CONSTRAINT "EmployerValidation_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingOutcome" ADD CONSTRAINT "TrainingOutcome_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingOutcome" ADD CONSTRAINT "TrainingOutcome_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
