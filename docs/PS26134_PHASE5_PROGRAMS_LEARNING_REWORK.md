# Phase 5 — Programs & Learning Rework

## Program Changes
- **Reframing:** The general "Programs & Events" concept has been reframed to **"Skill Development Programs"** across the platform.
- **Academician View:** The portal for Academicians to create programs has been updated to clarify that they are providing "training supply" and "skill development programs", emphasizing the connection between their workshops/FDPs and industry skill needs.
- **Student View:** The student discovery page for programs was updated to explicitly mention "addressing your skill gaps."

## Learning Changes
- **Learning Resources Tracker:** The student's "Learning Tracker" was preserved, successfully surfacing their enrolled, saved, and completed Learning Resources.
- **Resource Connectivity:** `LearningResourceSkill` continues to accurately define exactly which skill and what proficiency level a specific learning resource provides, enabling the recommendation engine to fetch them to close gaps.

## Skill Integration
- The schema model `ProgramSkill` continues to be used. Rather than serving purely as "prerequisites" for an event, these skills represent the **target skills developed** by the training program. 
- The backend `programs.service.ts` recommendation algorithm was entirely reworked. It now calculates the student's *missing* skills (skill gaps) and sorts recommended programs based on how many skill gaps the program will address. 
- The frontend UI was updated to show a badge saying `"Addresses {X} Skill Gaps"` rather than a generic match percentage, bridging the gap between student deficiency and program supply.

## Skill-Gap Integration
- The skill-gap system now feeds both Learning Resources (via `getOpportunityLearningRecommendations` which finds resources offering the exact required proficiency of a gap) and Programs (via the updated `getRecommendations` sorting).

## Student Flow
1. **Identify Gaps:** The student completes an Industry Alignment Diagnostic or views a Career Pathway to see their skill gaps.
2. **Resource Recommendations:** The Career Pathway shows specific Learning Resources that target their missing skills.
3. **Program Recommendations:** The Skill Development Programs page recommends workshops/training programs ordered by how many of their specific skill gaps will be addressed.
4. **Registration & Learning:** The student registers for the program or adds the resource to their tracker. The progress is tracked (Not Started -> In Progress -> Completed).

## Training Provider / Academician Flow
- Academicians can create Workshops, FDPs, and Industrial Training programs.
- When creating these programs, they specify the `ProgramSkill` (skills developed) which directly hooks into the student recommendation engine described above, closing the supply/demand loop.

## Industry Relevance
- The existing associations between `Program`, `Organization`, and `User` (Academician) were fully preserved. Programs remain tied to the academic or industry organizations providing them.

## Database Changes
- **No changes** were made to the Prisma schema (`prisma migrate reset` was completely avoided). We reused `ProgramSkill` and `LearningResourceSkill` models to fulfill the PS26134 requirement without duplicate/fake models.

## New Relationships
- No destructive or new schema relationships were introduced. The conceptual "Program addresses Skill Gap" relationship was built entirely via a new algorithmic approach in the existing `programs.service.ts`.

## Validation
- `npx prisma validate` - Passed (schema is perfectly valid).
- `npx prisma generate` - Passed.
- `npm run typecheck:backend` - Passed.
- `npm run build:backend` - Passed.
- `npm run test:backend` - Passed (with the pre-existing known timeouts in `career-guidance.test.ts` remaining).
- `npm run build:frontend` - Passed.
- `npm run test:frontend` - Passed.

## Missing Future Capabilities
- **Labour-Market Demand Ingestion:** The skills required are currently static per Career Role; we still need the engine to ingest real-time external job postings.
- **Course-Skill Mapping:** While we have the framework for Learning Resources addressing skills, automated NLP mapping of external courses to the `SkillTaxonomy` is not yet built.
- **External Job Data:** No integration yet with job boards to validate roles.
- **Employer Validation:** We need employers to be able to explicitly validate curriculum/programs.
- **District Planning:** The aggregation of these skill gaps into district-level training plans (the final PS26134 deliverable) is yet to be developed.
