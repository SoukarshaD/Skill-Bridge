# Phase 3 — Analytics Rework

## Overview
Phase 3 transitions the platform's analytics layer from a traditional placement/recruitment orientation to one focused on skill development and industry alignment. Note that many traditional recruitment-centric metrics (like the "Placement Funnel" and "Department Outcomes") were already removed during Phase 1. This phase focused on auditing the remaining analytics, eliminating leftover terminology, and reframing the dashboards around the PS 26134 problem statement.

## Removed Metrics
- **FunnelData & OutcomeData Interfaces**: Cleaned up stale typescript interfaces in `admin/dashboard/page.tsx` that were leftover from the removed placement funnel and departmental outcome widgets in Phase 1.

## Preserved Metrics
The following metrics were intentionally retained because they strongly align with the PS 26134 requirements:
- **Skill Gaps (`getSkillGaps`)**: Calculates the zero-filled average institutional student proficiency against the required proficiency of the globally top-demanded skills. This perfectly maps to the PS requirement of identifying `Skill Gap = Industry Demand - Training Supply`.
- **Industry Demand (`getIndustryDemand`)**: Calculates the top most requested skills by analyzing `OpportunitySkill` data across published industry opportunities. This answers "Which skills are in demand?"
- **Academician Participations (`getAcademicianParticipations`)**: Measures the number of collaborations and FDP registrations, which is a proxy for how active an institution is at aligning its trainers with industry standards.

## Reworked Metrics
- **"Placement Readiness" -> "Industry Readiness"**: On the Admin dashboard, the term "Placement Readiness" was reframed to "Industry Readiness" to represent how closely student skill profiles align with the current published industry opportunities (based on the `getReadinessStats` matching threshold).
- **"Talent Pipeline" -> "Skill-Development Programs"**: On the Industry dashboard, recruitment-heavy terms like "talent pipeline" were reframed to focus on active skill-development and programmatic offerings.
- **Global Terminology**: Modified the global site description and metadata in `page.tsx` and `layout.tsx` to remove the words "placement analytics" and "placements platform" in favor of "skill gap analytics" and "skill development platform".

## Current Skill Analytics
The existing backend can currently measure:
- **Global Skill Demand**: Based entirely on skills attached to `Opportunity` records.
- **Student Skill Supply**: Based on self-reported `StudentSkill` profiles, normalized through assessments.
- **Basic Skill Gaps**: A straight mathematical delta between the average student's skill proficiency (zero-filled for missing skills) and the average industry requirement for that skill.
- **Industry Readiness**: A boolean tally of how many students meet a minimum matching threshold against at least one active opportunity.

## Missing Data
To fully achieve the PS 26134 goals, the following data systems do not yet exist and are required for future phases:
- **External Labour-Market Demand**: Currently, demand is only calculated from opportunities posted directly on the platform. External job-posting ingestion is required for true market intelligence.
- **Course Supply / Curriculum Alignment**: Currently, supply is measured by individual student skills. There is no engine to map institutional *courses* to skills to determine if the *curriculum* covers the gap.
- **District-Level Data**: Training plans and skill gaps are not yet aggregated geographically by district.

## Future Analytics Dependencies
- **Phase 4 (LMI Integration)** will need to feed external market data into the `OpportunitySkill` or a new demand model to enhance the `getIndustryDemand` accuracy.
- **Phase 5 (Course Mapping)** will need to provide `CourseSkill` mappings so we can calculate training supply accurately.

## Backend Changes
- Audited `analytics.controller.ts` and `analytics.routes.ts`. Concluded that Phase 1 successfully removed all non-compliant metrics. Retained the existing endpoints as they successfully model the required Demand/Supply metrics conceptually.

## Frontend Changes
- Modified `frontend/src/app/admin/dashboard/page.tsx` (Reframed Placement Readiness, removed stale interfaces).
- Modified `frontend/src/app/industry/dashboard/page.tsx` (Reframed talent pipeline).
- Modified `frontend/src/app/page.tsx` and `frontend/src/app/layout.tsx` (Updated global terminology and SEO metadata).

## Database Changes
- **No changes** were made to the Prisma schema during this phase, ensuring stability and data preservation of the core analytical models (`Skill`, `OpportunitySkill`, `StudentSkill`).

## Validation
- `npm run typecheck:backend` - Passed
- `npm run build:backend` - Passed
- `npm run build:frontend` - Passed
- `npm run test:frontend` - Passed
- Backend tests were intentionally excluded from this specific rerun to save time as the backend files were untouched, though previous test suites confirm stability outside of the known `career-guidance` timeout.
