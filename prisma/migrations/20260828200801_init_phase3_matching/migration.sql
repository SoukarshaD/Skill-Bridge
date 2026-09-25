/*
  Warnings:

  - You are about to drop the column `requiredSkills` on the `Opportunity` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Opportunity" DROP COLUMN "requiredSkills";

-- CreateTable
CREATE TABLE "OpportunitySkill" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "requiredProficiency" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OpportunitySkill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OpportunitySkill_opportunityId_skillId_key" ON "OpportunitySkill"("opportunityId", "skillId");

-- AddForeignKey
ALTER TABLE "OpportunitySkill" ADD CONSTRAINT "OpportunitySkill_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunitySkill" ADD CONSTRAINT "OpportunitySkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "SkillTaxonomy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
