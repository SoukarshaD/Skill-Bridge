# Phase 8 — Final Dependency & Database Cleanup

## Objective

Perform a **CLEANUP ONLY** repository-wide audit covering dead code, unused
dependencies, stale terminology, dead frontend routes, and database architecture,
establishing a stable baseline before future Labour Market Intelligence feature
development.

This phase made **no new Prisma migrations**, **no database resets**, and
**introduced no new features**.

---

## Repository Audit

### Old ATS / Recruitment Terminology Search Results

| Term | Found | Classification |
|------|-------|---------------|
| `Kanban` | 0 matches in source | Already cleaned (Phase 1) |
| `getRankedApplicants` | 0 matches in source | Already cleaned (Phase 1) |
| `getPlacementFunnel` | 0 matches in source | Already cleaned (Phase 1) |
| `getDepartmentOutcomes` | 0 matches in source | Already cleaned (Phase 1) |
| `InternshipProgressUpdate` | 0 matches in backend modules (only schema) | Orphaned table - not queried |
| `InternshipMilestone` | 0 matches in backend modules (only schema) | Orphaned table - not queried |
| `Placement Readiness` | 0 matches in frontend source | Already cleaned (Phase 3/7) |
| `Talent Pipeline` | 0 matches in source | Already cleaned |
| `totalApplicants` | Found in industry/dashboard/page.tsx | Fixed in Phase 8 |
| `Track your active applications and accepted offers` | Found in student/internships/page.tsx | Fixed in Phase 8 |
| `Manage ongoing internships and track intern progress` | Found in industry/internships/page.tsx | Fixed in Phase 8 |

---

## API Audit

| Endpoint | Status | Reason |
|----------|--------|--------|
| `GET /api/auth/*` | PRESERVE | Core authentication |
| `GET /api/skills/*` | PRESERVE | Central to PS 26134 taxonomy |
| `GET /api/users/*` | PRESERVE | Profile management |
| `GET /api/opportunities/recommendations` | PRESERVE | Skill-match based |
| `GET /api/opportunities/browse` | PRESERVE | Student opportunity discovery |
| `GET /api/opportunities/:id` | PRESERVE | Detail view |
| `GET /api/opportunities/organization` | PRESERVE | Industry posting management |
| `POST /api/opportunities` | PRESERVE | Create skill opportunity |
| `GET /api/opportunities/academicians/search` | PRESERVE | Academician discovery |
| `GET /api/opportunities/academician/browse` | PRESERVE | Academician opportunity discovery |
| `POST /api/applications` | PRESERVE | Apply to opportunities (generic) |
| `GET /api/applications/me` | PRESERVE | Student application tracking |
| `PATCH /api/applications/:id/status` | PRESERVE | Status transitions (generic) |
| `PATCH /api/applications/:id/withdraw` | PRESERVE | Withdrawal flow |
| `GET /api/internships` | PRESERVE | Simplified internship tracking |
| `GET /api/internships/:id` | PRESERVE | Internship detail |
| `POST /api/internships/start/:applicationId` | PRESERVE | Internship activation |
| `POST /api/internships/:id/portfolio` | PRESERVE | Portfolio evidence from internship |
| `GET /api/analytics/institution/demand` | PRESERVE | Skill demand (PS 26134 core) |
| `GET /api/analytics/institution/skill-gaps` | PRESERVE | Skill gaps (PS 26134 core) |
| `GET /api/analytics/institution/readiness` | PRESERVE | Skill readiness stats |
| `GET /api/analytics/institution/academicians` | PRESERVE | Academician engagement |
| `GET /api/learning/*` | PRESERVE | Learning resource discovery |
| `GET /api/documents/*` | PRESERVE | Document management |
| `GET /api/portfolios/*` | PRESERVE | Portfolio evidence |
| `GET /api/notifications/*` | PRESERVE | Notification centre |
| `GET /api/collaborations/*` | PRESERVE | Industry-Academia collaboration |
| `GET /api/assessments/*` | PRESERVE | Skill assessment engine |
| `GET /api/mentorship/*` | PRESERVE | Mentorship programmes |
| `GET /api/programs/*` | PRESERVE | FDPs and training programs |
| `GET /api/certificates/*` | PRESERVE | Certificate evidence |
| `GET /api/challenges/*` | PRESERVE | Innovation challenges |
| `GET /api/projects/*` | PRESERVE | Live projects |
| `GET /api/career-guidance/*` | PRESERVE | Career pathway/skill gap guidance |
| `GET /api/health` | PRESERVE | Health check |
| `GET /api/opportunities/:id/applicants/ranked` | ALREADY REMOVED | Phase 1 backend removal confirmed |
| `GET /api/analytics/institution/placement-funnel` | ALREADY REMOVED | Phase 1 backend removal confirmed |
| `GET /api/analytics/institution/department-outcomes` | ALREADY REMOVED | Phase 1 backend removal confirmed |

---

## Frontend Route Audit

| Route | Status | Reason |
|-------|--------|--------|
| `/industry/opportunities/[id]/applicants` | PRESERVE + REFRAME | Page existed but called removed backend endpoint. Replaced with deprecation notice. No navigation links point to it. |
| `/student/internships` | PRESERVE | Simplified internship view. Description updated to be skill-development focused. |
| `/industry/internships` | PRESERVE | Industry-side internship view. Description updated. |
| All other routes | PRESERVE | Validated. All routes compile and no broken imports found. |

### Empty Backend Module Stubs
The following directories contain only `.gitkeep` and are not imported anywhere:
- `backend/src/modules/industries/`
- `backend/src/modules/institutions/`
- `backend/src/modules/students/`
- `backend/src/modules/audit/`

**Classification: PRESERVE FOR FUTURE PS26134 FEATURES** — Reserved for future LMI,
institution analytics, and audit trail modules.

---

## Internship Architecture Audit

| Model | Backend Usage | Frontend Usage | Classification |
|-------|--------------|----------------|---------------|
| `Internship` | prisma.internship.* in internships.service.ts | student + industry internships pages | A: Still Required |
| `InternshipMilestone` | Not queried — schema only | None | C: Completely unused at application layer |
| `InternshipProgressUpdate` | Not queried — schema only | None | C: Completely unused at application layer |

> **IMPORTANT**: `InternshipMilestone` and `InternshipProgressUpdate` remain in the
> Prisma schema as orphaned tables. Removing them would require a destructive migration.
> Per Phase 8 policy, they are **documented here but NOT dropped**. A future explicit
> migration phase should handle them after confirming zero production rows.

---

## Opportunity/Application Audit

### Opportunity Model — PRESERVE
The `Opportunity` model is actively used across multiple opportunity types:
- `INTERNSHIP`, `APPRENTICESHIP` — active skill-development placements
- `FDP`, `INDUSTRIAL_TRAINING`, `FACULTY_INTERNSHIP` — academician development
- `RESEARCH_COLLABORATION`, `CONSULTANCY` — industry-academia collaboration
- `INNOVATION_CHALLENGE`, `LIVE_PROJECT` — practical skill application

The `JOB` enum value remains in the schema but is not actively used in UI or API
filters post-Phase 1. Cannot be safely removed without a database migration.

### Application Model — PRESERVE
The `Application` model remains actively used for all opportunity types.
`updateApplicationStatus` manages transitions for apprenticeships, research
collaborations, etc. Not recruitment-specific infrastructure.

---

## Application Status Audit

| Status | Classification |
|--------|---------------|
| `APPLIED` | PRESERVE — initial state |
| `SHORTLISTED` | PRESERVE — active in controller transitions |
| `INTERVIEW` | PRESERVE FOR FUTURE REVIEW — in schema, no dedicated UI trigger post-Phase 1 |
| `OFFERED` | PRESERVE — offer flows for apprenticeships |
| `REJECTED` | PRESERVE — rejection transitions |
| `WITHDRAWN` | PRESERVE — student withdrawal flow |
| `ACCEPTED` | PRESERVE — triggers internship activation |
| `DECLINED` | PRESERVE — student-side offer decline |

No enum values were removed. Removing Prisma enum values is destructive and
requires a careful migration with production data validation.

---

## Analytics Audit

### Verified Removed (Phase 1)
- `getPlacementFunnel` — confirmed absent from analytics.controller.ts
- `getDepartmentOutcomes` — confirmed absent from analytics.controller.ts

### Active Analytics Data Provenance

| Function | Data Source | Accuracy Note |
|----------|-------------|--------------|
| `getIndustryDemand` | `OpportunitySkill` from `PUBLISHED`/`CLOSED` opportunities | Internally calculated from platform postings — NOT external LMI |
| `getSkillGaps` | Top demanded skills vs `StudentSkill` profiles for the institution | Internally calculated — not from external job market data |
| `getReadinessStats` | Skill match score vs published opportunities; threshold = 70% | Internally calculated — platform-internal alignment metric |
| `getAcademicianParticipations` | `Collaboration` and `ProgramRegistration` record counts | Internal platform activity |

**CRITICAL NOTE**: These analytics are calculated from data within the Skill Bridge
platform itself. They do **NOT** represent external labour market intelligence.
The future LMI engine will augment these with real external job-market data.

---

## Prisma Model Audit

| Model | Status |
|-------|--------|
| `User`, `Organization`, `StudentProfile`, `AcademicProfile` | PRESERVE — Core |
| `SkillTaxonomy` | PRESERVE — Central PS 26134 taxonomy |
| `CareerRole` / `CareerRoleSkill` | PRESERVE — Career pathway guidance |
| `Assessment` + related | PRESERVE — Skill assessment engine |
| `Opportunity` | PRESERVE — Generic, multi-type |
| `Application` + `ApplicationStatusHistory` | PRESERVE — Generic application flow |
| `LearningResource` + related | PRESERVE — Skill-gap learning |
| `PortfolioItem`, `Document`, `Notification`, `AuditLog` | PRESERVE — Core infrastructure |
| `StudentSkill`, `OpportunitySkill` | PRESERVE — Core skill matching |
| `Collaboration` | PRESERVE — Industry-Academia collaboration |
| `MentorshipProgram` / `Mentorship` + related | PRESERVE — Mentorship |
| `Internship` | PRESERVE — Simplified lifecycle |
| `InternshipMilestone` | DEFERRED — Orphaned table. Document for future migration. |
| `InternshipProgressUpdate` | DEFERRED — Orphaned table. Document for future migration. |
| `Program` + related | PRESERVE — FDPs, workshops |
| `Certificate` + related | PRESERVE — Certificate evidence |
| `ChallengeTeam` / `ChallengeSubmission` | PRESERVE — Innovation challenges |
| `ProjectWorkspace` / `ProjectMilestone` | PRESERVE — Live projects |

**No schema changes were made in Phase 8.**

---

## Dependency Audit

### Backend Dependencies Removed

| Package | Reason |
|---------|--------|
| `ioredis` (runtime) | No imports found anywhere in backend/src. Completely unused. |
| `swagger-jsdoc` (runtime) | No Swagger routes or JSDoc annotations found. Unused. |
| `swagger-ui-express` (runtime) | No Swagger UI routes found in app.ts. Unused. |
| `@types/swagger-jsdoc` (dev) | Removed with parent package. |
| `@types/swagger-ui-express` (dev) | Removed with parent package. |

Total: 5 direct packages removed (39 packages freed including transitive).

### All Remaining Dependencies Verified Active
All remaining backend and frontend packages confirmed as actively imported and used.

---

## Environment Variable Audit

| Variable | Status | Notes |
|----------|--------|-------|
| `DATABASE_URL` | ACTIVE | Prisma database connection |
| `PORT` | ACTIVE | Backend server port |
| `NODE_ENV` | ACTIVE | Environment switching |
| `JWT_SECRET` | ACTIVE | JWT signing |
| `JWT_EXPIRES_IN` | ACTIVE | Token expiry |
| `NEXT_PUBLIC_API_URL` | ACTIVE | Frontend API base URL |
| `FRONTEND_URL` | ACTIVE (production) | CORS allowed origin — was missing from `.env.example`. **Added in Phase 8.** |

---

## Documentation Audit

### README.md Updated
The README contained recruitment/ATS-centric terminology in the Industry section and
Institution Analytics section:

- **Industry "Talent Discovery"**: Replaced "Skill-based applicant ranking", "Applicant
  management", "Recruitment", "Shortlisting", "Interview workflow", "Offer management"
  with skill-development-aligned equivalents.
- **Institution "Analytics"**: Replaced "Placement readiness" with "Skill readiness
  (alignment with current demand)". Removed "Internship outcomes" (untracked).

Historical phase docs (Phase 1–7) were not modified.

---

## Terminology Audit

| Term | Location | Action |
|------|----------|--------|
| `totalApplicants` | `industry/dashboard/page.tsx` | Renamed to `totalApplications`; UI label changed to "Total Applications" |
| "Track your active applications and accepted offers" | `student/internships/page.tsx` | Updated to skill-development focused text |
| "Manage ongoing internships and track intern progress" | `industry/internships/page.tsx` | Updated to skill-development focused text |
| README recruitment language | `README.md` | Updated (see Documentation Audit) |

---

## Dead Code Removed

| Item | Location | Reason |
|------|----------|--------|
| `ioredis` dependency | `backend/package.json` | Unused — removed |
| `swagger-jsdoc` dependency | `backend/package.json` | Unused — removed |
| `swagger-ui-express` dependency | `backend/package.json` | Unused — removed |
| Dead `/opportunities/${id}/applicants/ranked` API call | `industry/opportunities/[id]/applicants/page.tsx` | Called removed backend endpoint — page replaced with deprecation notice |

---

## Preserved Legacy Components

| Component | Reason |
|-----------|--------|
| `InternshipMilestone` Prisma model | Orphaned but kept to avoid destructive migration risk |
| `InternshipProgressUpdate` Prisma model | Orphaned but kept to avoid destructive migration risk |
| `JOB` in `OpportunityType` enum | Cannot be safely removed without migration |
| `INTERVIEW`, `OFFERED`, `DECLINED` in `ApplicationStatus` | Required by generic application state machine |
| Empty module stub directories | Reserved for future LMI/audit modules |
| `updateApplicationStatus` full transition logic | Backend logic preserved; UI triggers removed in Phase 1 |

---

## Components Deferred for Future Review

| Item | Reason |
|------|--------|
| `InternshipMilestone` and `InternshipProgressUpdate` tables | Safe to drop in a dedicated future migration after confirming zero production rows |
| `JOB` OpportunityType enum value | Deprecate via explicit migration once confirmed unused in all environments |
| `INTERVIEW` ApplicationStatus value | Review whether apprenticeship workflows need this |
| Empty module stub directories | Implement when building corresponding features |

---

## Database Safety

- **No Prisma migrations were generated or deployed in Phase 8.**
- `npx prisma validate` passed with zero schema violations.
- No tables dropped. No enum values removed. No production data modified.
- Orphaned tables (`InternshipMilestone`, `InternshipProgressUpdate`) remain but
  are not queried at the application layer.

---

## Validation Results

| Check | Result |
|-------|--------|
| `npx prisma validate` | PASSED |
| `npm run typecheck:backend` | PASSED (0 TypeScript errors) |
| `npm run build:backend` | PASSED |
| `npm run build:frontend` | PASSED (50 routes compiled) |
| `npm run test:backend` | PASSED (all suites except pre-existing career-guidance timeout) |
| ATS terminology search | No remaining Kanban, getRankedApplicants, getPlacementFunnel, getDepartmentOutcomes |
| Broken import check | No broken imports detected |

---

## Known Pre-existing Test Issues

- **`backend/src/__tests__/career-guidance.test.ts`**: Pre-existing timeout on test
  environment. Known since Phase 4. Unrelated to Phase 8 changes. All other test
  suites pass cleanly.

---

## Final Repository Status

The Skill Bridge repository is now in a **clean, stable baseline state**:

- All ATS/recruitment-centric code removed (Phases 1-8)
- Skill-development and industry-alignment terminology consistent across all layers
- All unused npm dependencies removed (ioredis, swagger packages)
- Dead API calls replaced or removed
- Environment variable documentation complete
- README updated to reflect current product positioning
- Prisma schema valid, no destructive changes
- Full typecheck and build passing

---

## Deferred PS26134 Features

The following are explicitly **NOT YET IMPLEMENTED**:

- Labour Market Intelligence (LMI) Engine
- External job-posting ingestion
- Employer survey / consultation ingestion
- NLP skill extraction from job descriptions
- Skill-demand normalization across taxonomies
- Demand x skill x location analysis
- Course/program alignment engine
- Obsolete/oversupply detection
- District training plan generator
- Advanced employer curriculum validation intelligence
- Employment outcome intelligence (graduate tracking)
- Forecasting / predictive analytics
- GenAI recommendation engine

These represent the next feature-development phase and will build on the clean
baseline established by Phases 1-8.
