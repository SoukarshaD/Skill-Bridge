# Phase 15: Employer Validation & Outcomes

## 1. Objective
To close the feedback loop on labour market intelligence by allowing industry partners to validate skill and program demand, and by securely capturing training outcomes. This acts as real-world evidence confirming or adjusting theoretical demand models.

## 2. Existing Architecture Reused
- Authentication and RBAC (JWT-based, protecting endpoints)
- `Program`, `SkillTaxonomy`, and `Organization` models reused as anchor references.
- `LmiFeedbackService` built alongside existing LMI services (Phase 11-14) to provide additional context without altering the core raw demand ingestion calculations.

## 3. Employer Validation Workflow
- **Roles:** Only `INDUSTRY` users (attached to an `Organization`) can submit employer validations.
- **Scope:** An employer can validate a Skill (e.g., React) globally or a specific Program (e.g., Full Stack Development Bootcamp).
- **Validation Scale:** `RELEVANT`, `LOW_RELEVANCE`, `EMERGING_IMPORTANCE`.
- **Deduplication:** At the application layer (Prisma upsert equivalent using `findFirst` + `update`/`create`), an organization can only have one active validation per skill/program.

## 4. Outcome Workflow
- **Roles:** `ADMIN` and `ACADEMICIAN` users can submit outcome records.
- **Categories:** `TRAINING_COMPLETED`, `EMPLOYMENT`, `APPRENTICESHIP`, `FURTHER_TRAINING`, `NOT_PLACED`, `UNKNOWN`.
- **Workflow:** An outcome record is upserted based on `programId`, `studentId`, and `category`. A student can have multiple categories recorded over time (e.g., completed, then employed).

## 5. Intelligence Methodology
- **Validation Confidence:** 
  - 0 = NO_VALIDATION
  - 1-2 = LOW
  - 3-5 = MEDIUM
  - 6+ = HIGH
- **Outcome Small Sample Protection:** Programs with fewer than 5 tracked students return `INSUFFICIENT_DATA` for their outcome evidence status to prevent misleading statistics. 
- **Non-Invasive:** Employer Validation is an *independent evidence overlay*. It does **NOT** artificially inflate the raw `DemandScore` from Phase 11. 
- **ATS Exclusion:** No candidate ranking, recruitment funnel, interview pipeline, or ATS structures were revived. Outcomes are high-level observed statistical milestones.

## 6. API Endpoints
- `POST /api/lmi/employer-validations`
- `GET /api/lmi/skills/:skillId/employer-validations`
- `GET /api/lmi/programs/:programId/employer-validations`
- `POST /api/lmi/outcomes`
- `GET /api/lmi/programs/:programId/outcomes`

## 7. Frontend Routes
- `/admin/lmi/employer-validation` (New dashboard for Admins)
- `/academician/programs/[id]` (Added a widget to view program validation and outcomes)

## 8. Files Added/Modified
- `backend/src/modules/lmi/lmi-feedback.service.ts` (New)
- `backend/src/modules/lmi/lmi.controller.ts` (Modified)
- `backend/src/modules/lmi/lmi.routes.ts` (Modified)
- `backend/src/__tests__/lmi-employer-validation.test.ts` (New)
- `backend/src/__tests__/lmi-outcomes.test.ts` (New)
- `frontend/src/app/admin/lmi/employer-validation/page.tsx` (New)
- `frontend/src/app/academician/programs/[id]/page.tsx` (Modified)
- `prisma/schema.prisma` (Modified)

## 9. Database Changes
- Added `EmployerValidation` model linking `organizationId`, `userId`, `skillId` (optional), and `programId` (optional).
- Added `TrainingOutcome` model linking `programId`, `studentId`, and `category`.

## 10. Privacy Considerations
- Employer comments and the list of validating organizations are only exposed to appropriate roles via backend RBAC. 

## 11. Known Limitations
- Real-time DB listeners are not used; the dashboard reflects the latest state via REST polling or page reload.
- Outcomes depend on academician or system inputs, as we intentionally bypassed re-integrating the legacy ATS module.
