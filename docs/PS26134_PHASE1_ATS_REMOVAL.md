# Phase 1 — ATS Removal

## Removed
- Traditional ATS Kanban Board and Applicant Pipeline UI in the Industry Dashboard (`frontend/src/app/industry/opportunities/[id]/applicants`).
- Job applicant view links from the Industry Dashboard and Industry Opportunities pages.
- `getRankedApplicants` API endpoint used for the Kanban board in the opportunities controller.
- Placement Funnel (`getPlacementFunnel`) and Department Outcomes (`getDepartmentOutcomes`) API endpoints and rendering from the `admin/dashboard`, as these were purely based on traditional recruitment metric flows.
- Legacy ATS pipeline metrics in the admin dashboard UI.

## Preserved
- `Opportunity` Model: Kept entirely intact.
- `Application` Model: Kept intact.
- Application submission API (`applyToOpportunity`), and basic student application views.
- Authentication, RBAC, Database architecture, and all models listed in the migration audit (SkillTaxonomy, CareerRole, Programs, Mentorship, Challenges, etc.).
- The `updateApplicationStatus` backend endpoint (still necessary for other flows like students withdrawing their applications).
- `OpportunityStatus` and `ApplicationStatus` Enums (as these are needed for `Apprenticeships`, `Research Collaborations`, etc., and deleting Enum values natively via Prisma is tricky and can lead to validation issues without a database reset).

## Opportunity Model
The `Opportunity` model was intentionally preserved because it acts polymorphically for multiple opportunity types including `APPRENTICESHIP`, `RESEARCH_COLLABORATION`, `CONSULTANCY`, `FDP`, and more. Removing it would break the core capability of academic-industry engagement required by PS 26134.

## Application Model
The `Application` model was preserved and left intact. While the traditional "Job Application Pipeline" UI was removed for Industry, the Application model itself is used for students applying to other opportunity types (such as `Apprenticeships` and `Live Projects`). The underlying state machine in `updateApplicationStatus` was preserved because it manages basic flows (like student application withdrawals) which are still relevant.

## Database Changes
No changes were made to the Prisma Schema. The Prisma validation step confirmed that the database remains intact without destructive resets.

## Frontend Changes
- **Removed Directory**: Deleted `frontend/src/app/industry/opportunities/[id]/applicants` (the Kanban board).
- **Modified**: `frontend/src/app/industry/opportunities/page.tsx` — removed the "View Applicants" link for opportunities.
- **Modified**: `frontend/src/app/industry/dashboard/page.tsx` — removed links to the Kanban board, leaving a non-clickable title. Changed "Applicants" to "Applications".
- **Modified**: `frontend/src/app/admin/dashboard/page.tsx` — removed Placement Funnel chart, Department Outcomes chart, and associated data fetching states.
- **Modified**: `frontend/src/app/industry/internships/page.tsx` — updated dead text instructing users to use the (now deleted) applicant opportunity dashboard.

## Backend Changes
- **Modified**: `backend/src/modules/opportunities/opportunities.controller.ts` — removed the `getRankedApplicants` function.
- **Modified**: `backend/src/modules/opportunities/opportunities.routes.ts` — removed the `/:id/applicants/ranked` route.
- **Modified**: `backend/src/modules/analytics/analytics.controller.ts` — removed `getPlacementFunnel` and `getDepartmentOutcomes`.
- **Modified**: `backend/src/modules/analytics/analytics.routes.ts` — removed the corresponding ATS analytics routes.
- **Modified**: `backend/src/__tests__/test-cleanup.ts` — Fixed an underlying test cleanup issue by adding `await prisma.program.deleteMany();` before deleting Users.
- **Modified**: `backend/src/__tests__/analytics.test.ts` — Removed obsolete tests related to the deleted placement funnel and outcomes endpoints.

## Validation
The following validation commands were run and passed successfully:
- `npx prisma validate` & `npx prisma generate`
- `npm run typecheck:backend`
- `npm run build:backend`
- `npm run test:backend`
- `npm run build:frontend`
- `npm run test:frontend`
- Repository-wide searches were performed to ensure no dangling references to `applicants` or `SHORTLISTED` were left in broken links.

## Remaining Legacy Functionality
- `JOB` Opportunity Type: This type is still present in the `OpportunityType` enum and `Opportunity` model because it would require a database schema migration.
- `updateApplicationStatus` logic: Still contains transitions like `INTERVIEW` -> `OFFERED`. It was intentionally left because `ApplicationStatus` enum values exist and are potentially used by other features; the UI to trigger these states has just been removed.
- `Internships` lifecycle: Kept for now per the user's instructions to stop after Phase 1.
