ALTER TABLE "DemandSignal" ADD COLUMN "rawRoleTitle" TEXT,
ADD COLUMN "normalizedLocation" TEXT;

ALTER TABLE "DemandSignalSkill" ADD COLUMN "rawSkillName" TEXT NOT NULL,
ADD COLUMN "normalizationMethod" TEXT,
ADD COLUMN "confidence" DOUBLE PRECISION,
ALTER COLUMN "skillId" DROP NOT NULL;

ALTER TABLE "DemandSignalSkill" DROP CONSTRAINT "DemandSignalSkill_skillId_fkey";
ALTER TABLE "DemandSignalSkill" ADD CONSTRAINT "DemandSignalSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "SkillTaxonomy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

DROP INDEX "DemandSignalSkill_demandSignalId_skillId_key";
CREATE UNIQUE INDEX "DemandSignalSkill_demandSignalId_rawSkillName_key" ON "DemandSignalSkill"("demandSignalId", "rawSkillName");
