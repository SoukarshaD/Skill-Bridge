/*
  Warnings:

  - You are about to drop the column `skills` on the `LearningResource` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "LearningProgress" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- DropIndex
DROP INDEX "LearningResource_skills_idx";

-- AlterTable
ALTER TABLE "LearningResource" DROP COLUMN "skills";

-- CreateTable
CREATE TABLE "LearningResourceSkill" (
    "id" TEXT NOT NULL,
    "learningResourceId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "targetProficiency" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "LearningResourceSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentLearningResource" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "learningResourceId" TEXT NOT NULL,
    "status" "LearningProgress" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "StudentLearningResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LearningResourceSkill_learningResourceId_skillId_key" ON "LearningResourceSkill"("learningResourceId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentLearningResource_studentProfileId_learningResourceId_key" ON "StudentLearningResource"("studentProfileId", "learningResourceId");

-- AddForeignKey
ALTER TABLE "LearningResourceSkill" ADD CONSTRAINT "LearningResourceSkill_learningResourceId_fkey" FOREIGN KEY ("learningResourceId") REFERENCES "LearningResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningResourceSkill" ADD CONSTRAINT "LearningResourceSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "SkillTaxonomy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentLearningResource" ADD CONSTRAINT "StudentLearningResource_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentLearningResource" ADD CONSTRAINT "StudentLearningResource_learningResourceId_fkey" FOREIGN KEY ("learningResourceId") REFERENCES "LearningResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
