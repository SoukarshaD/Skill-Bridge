# Phase 6 — Academician + Industry Collaboration Rework

## Collaboration Changes
- The conceptual purpose of the collaboration system was completely reframed from generic "Academia ↔ Industry Collaboration" to **"Industry-Aligned Training & Curriculum Collaboration"**.
- Terminology across both Academician and Industry dashboards has been updated to reflect curriculum redesign, joint training, and skill validation.

## Curriculum Alignment
- The existing `Collaboration` model has been adapted to function as a **Curriculum Alignment Proposal**.
- Academicians can now submit a proposal for curriculum review or joint skill-development. The previous generic "Proposal Description" is now explicitly labeled "Proposal Description & Curriculum Changes".

## Industry Validation
- Industry validation was seamlessly mapped to the existing `CollaborationStatus` state machine.
- The `ACCEPTED` state now functions conceptually as an industry endorsement/validation.
- Industry partners click **"Validate & Endorse Proposal"** (previously "Accept Proposal") to validate the academician's curriculum changes or training proposal.

## Skill Integration
- The `Collaboration.expertise` array (`String[]`) was successfully repurposed as **"Target Skills"**.
- This enables pure application-level reuse without any database schema changes or duplicate skill models, adhering strictly to the constraints.
- When academicians create proposals, they list the comma-separated target skills the curriculum or joint program addresses.

## Program Integration
- When a curriculum proposal is validated and moved to the `ACTIVE` state, the UI now directly prompts both Academician and Industry users to **"Create Associated Skill Program"**.
- This acts as a bridge, immediately linking a validated industry proposal to the creation of a skill-development `Program` (reusing the work from Phase 5).

## Academician Experience
- "My Collaborations" is now **"Industry Skill Collaboration"**.
- Actions like "Propose Collaboration" have been reframed to **"Propose Curriculum Alignment / Joint Training"**.
- The page explicitly guides academicians to "Manage your curriculum alignment and joint skill-development proposals."

## Industry Experience
- "Incoming Proposals" is now **"Industry Validation & Curriculum Alignment"**.
- Industry users are guided to "Review curriculum alignment proposals and validate training requirements."
- The action lifecycle now follows: `Start Industry Review` -> `Validate & Endorse Proposal` -> `Start Joint Skill Development`.

## Database Changes
- **No changes** were made to the Prisma schema (`prisma migrate reset` was completely avoided). 
- We reused `Collaboration`, `OpportunityType`, and `CollaborationStatus` models to fulfill the PS26134 requirement without duplicate/fake models.

## New Relationships
- No destructive or new schema relationships were introduced. The conceptual "Collaboration -> Program" relationship was bridged using UI flow (action buttons directing validated proposals into program creation).

## Validation
- `npx prisma validate` - Passed (schema is perfectly valid).
- `npx prisma generate` - Passed.
- `npm run typecheck:backend` - Passed.
- `npm run build:backend` - Passed.
- `npm run test:backend` - Passed (with the pre-existing known timeouts in `career-guidance.test.ts` remaining).
- `npm run build:frontend` - Passed.
- `npm run test:frontend` - Passed.

## Future Requirements
- **Employer Survey Ingestion**: Future phases will need to automate the intake of bulk employer validations or surveys (Labour Market Intelligence).
- **Automated Skill Extraction**: NLP extraction of skills from these proposals into formal `SkillTaxonomy` entities is not yet implemented.
- **Predictive Forecasting**: Forecasting future skill requirements based on industry validation trends is out of scope for this phase.
