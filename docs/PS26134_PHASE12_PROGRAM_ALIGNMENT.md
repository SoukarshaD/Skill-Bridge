# Phase 12 — Program / Course Alignment Intelligence

## Objective
Build the **Course / Program Alignment Intelligence** layer that directly compares active training programs against the derived market demand from Phase 11. This phase calculates how well a program's target curriculum covers actual highest-demanded skills and clearly highlights any critical missing gaps.

## Existing Models Reused
- `DemandSignal` and `DemandSignalSkill` (indirectly via Phase 11 service)
- `Program` and `ProgramSkill` (Training Supply)
- `SkillTaxonomy` (Canonical mapping entity)
- `CareerRole` and `CareerRoleSkill` (for context-specific alignment targeting)

## Demand Dependency
This phase relies entirely on the output of the **Phase 11 (Demand vs Training Supply)** Intelligence layer. 
It makes NO direct raw queries to `DemandSignal`. Instead, it pulls the pre-aggregated `demandScore` and `gapClassification` from Phase 11 to avoid double-counting and performance overhead, ensuring consistency across the entire LMI module.

## Alignment Methodology
Alignment measures the percentage of demanded skills covered by a given training program. 
- **Context:** A program's alignment can be viewed broadly (Top 20 highly demanded skills in a region) or role-specifically (the required skills for a given CareerRole + dynamic LMI demand).
- **Weighting:** Skills are weighted by their Phase 11 `demandScore`. Simply adding a low-demand skill does not boost alignment as much as adding a high-demand skill.

## Alignment Formula
```
alignmentScore = (sum of demand scores of covered skills) / (sum of demand scores of all skills in context universe) * 100
```
- *Covered weight* = The Phase 11 `demandScore` for each skill the program actively targets (`ProgramSkill`).
- *Total weight* = The Phase 11 `demandScore` for the entire evaluated universe (e.g. all skills dynamically demanded for a specific Role).

## Covered Skills
Skills present in the program's `ProgramSkill` list that also appear in the high-demand universe. These are returned with their associated `demandScore` and `gapClassification`.

## Missing Skills
Skills present in the high-demand universe that are absent from the program's `ProgramSkill` list. These are classified with reasons such as "Core requirement for targeted role" or "High dynamic industry demand" to help institutions understand *why* they should consider adding them.

## Role Alignment
If a `roleId` is provided (e.g. evaluating a program meant for "Software Developers"), the "demand universe" shifts. It includes all static `CareerRoleSkill` entries (baseline 1.0 weight) PLUS any skill currently experiencing active market demand for that role in Phase 11. 

## Location Alignment
If a `location` filter is provided, the alignment fetches the Phase 11 demand localized to that region. For instance, a program in Pune is aligned specifically against the LMI demand signals originating from Pune. Online programs are treated as globally available.

## API
- `GET /api/lmi/program-alignment` — Retrieves all published programs, calculates alignment, and highlights how many High-Gap skills they are missing.
- `GET /api/lmi/program-alignment/:programId` — Fetches detailed explainability for a single program, listing exact covered and missing skills.
- `GET /api/lmi/skill-coverage/:skillId` — Inverts the view to find which programs cover a specific demanded skill.

## Frontend
- Added a dedicated Dashboard at `/admin/lmi/program-alignment` to view a list of all active programs and their Alignment Scores, and click "Analyze" to see detailed Covered/Missing skills.
- Added an embedded **"Industry Alignment" widget** inside the existing `/academician/programs/[id]` page, allowing Academicians to see how well their own courses align with the market without needing full LMI access.

## Explainability
Every API response and frontend view includes an explainability block or text. The UI clearly denotes:
> *"Platform-derived curriculum alignment insights based on current labour market demand."*

## Security
- `GET /api/lmi/program-alignment` is restricted to `ADMIN`, `INDUSTRY`, and `ACADEMICIAN` roles (Academicians need read-only access to view their own course alignment).
- No writable endpoints were created. Alignment is derived dynamically and is inherently read-only.

## Testing
- Tests written in `backend/src/__tests__/lmi-alignment.test.ts`.
- Validates a "Full Program" achieving 100% alignment and a "Partial Program" identifying missing skills.
- Validates location filtering and skill-coverage endpoints.

## Validation
- `npm run test:backend` passing (with pre-existing unrelated career-guidance timeout remaining known).
- `npx prisma validate` passing. No database schema changes were necessary.
- Frontend builds cleanly (`npm run build:frontend`).

## Limitations
- **Platform-derived:** As with Phase 11, this relies on what's manually ingested into the platform. External live job scraping is not yet implemented.
- **Curriculum is not automatically modified:** The system purely outputs read-only insights ("Skills to consider"). It does not generate syllabuses or alter `ProgramSkill` relationships directly.
- **Employer validation is not yet implemented.**
- **Obsolete/Oversupply detection is not implemented.** (Saved for Phase 13).
- **No Predictive Forecasting.**
