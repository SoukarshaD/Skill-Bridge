# VIBE CODING SPECIFICATION
## Academia–Industry Collaboration Portal for Skill Mapping, Internships & Placements

**Source:** PRD_Academia_Industry_Collaboration_Portal.md  
**Purpose:** Implementation specification for Antigravity + Gemini, with Stitch used for UI/design generation  
**Target:** Smart India Hackathon (SIH) 2026 MVP  
**Status:** Implementation-ready baseline

---

# 1. HOW TO USE THIS DOCUMENT

This document translates the product PRD into an implementation-oriented specification.

The implementation agent must:
1. Treat this document as the primary implementation source of truth.
2. Preserve the product terminology and four roles:
   - Student
   - Academician
   - Industry/Recruiter
   - Institution Admin
3. Build a working MVP first; do not implement future-phase features unless explicitly requested.
4. Work incrementally by phase.
5. Never replace working functionality merely to introduce a new library or architecture.
6. Before changing an existing module, inspect the current implementation and preserve existing behavior unless the change explicitly requires otherwise.
7. Use realistic seeded demo data so every major dashboard and recommendation flow is demonstrable.
8. Keep the recommendation system explainable: every match must be able to show matched skills, missing skills, and the resulting score.

---

# 2. PRODUCT NORTH STAR

The platform's central loop is:

ASSESS
→ PROFILE
→ IDENTIFY SKILL GAPS
→ RECOMMEND LEARNING
→ MATCH INTERNSHIPS/JOBS
→ APPLY
→ TRACK
→ BUILD VERIFIED PORTFOLIO
→ INSTITUTION ANALYTICS

The primary differentiator is not simply job discovery. The platform connects industry demand to student skill development and then to opportunities.

A student's skill gap should directly influence:
- recommended learning resources;
- recommended internships;
- recommended jobs;
- readiness indicators.

Institution analytics should aggregate these signals to reveal:
- department/program skill gaps;
- internship participation;
- placement funnel;
- in-demand skills.

---

# 3. MVP BOUNDARY

## P0 — Must work

- Authentication and role-based access
- Student skill assessment
- Student skill profile
- Skill-gap identification
- Industry skill taxonomy
- Internship/job posting
- Student opportunity browsing
- Student applications
- Explainable skill matching
- Basic recommendation engine
- Role-specific dashboards

## P1 — Strongly recommended

- Application status tracking
- Institution analytics
- Digital portfolio
- Industry applicant ranking
- Learning/training recommendations
- Basic document upload
- Academician opportunity board

## P2/P3 — Only if time remains

- Notifications
- Verification workflow enhancements
- Messaging
- Advanced learning enrollment
- Advanced credential verification

Do NOT allow lower-priority features to delay the P0 core loop.

---

# 4. USERS AND RBAC

## 4.1 Student

Can:
- register/login;
- complete assessments;
- view skill profile;
- view skill gaps;
- select target roles/interests;
- view learning recommendations;
- browse/search/filter opportunities;
- see match percentages;
- view matched/missing skills;
- apply;
- track applications;
- manage portfolio;
- upload documents;
- view verified/self-reported status.

Cannot:
- post opportunities;
- access institution-wide analytics;
- access other students' private information.

## 4.2 Industry/Recruiter

Can:
- register/login;
- maintain organization profile;
- create internship/job/training postings;
- specify required skills;
- view applicants;
- see skill-match scores;
- filter/rank applicants;
- shortlist candidates;
- change application status;
- view permitted student profile information;
- publish learning programs.

Cannot:
- access institution-wide private analytics unless explicitly authorized.

## 4.3 Academician

Can:
- register/login;
- maintain expertise profile;
- browse FDPs;
- browse faculty internships;
- browse industrial training;
- browse consultancy opportunities;
- browse research collaboration opportunities;
- express interest/apply;
- track status;
- be discoverable by industry for consultancy/research pairing.

## 4.4 Institution Admin / TPO

Can:
- manage institution;
- bulk onboard students/faculty;
- view student readiness analytics;
- view skill-gap trends;
- view internship/placement funnel;
- view industry demand trends;
- export reports;
- verify appropriate student portfolio entries;
- manage institution-level data.

---

# 5. CORE INFORMATION ARCHITECTURE

## Public

- Landing page
- About / How it works
- Opportunity discovery preview if desired
- Login
- Registration
- Privacy / Terms placeholders

## Authenticated Student

- `/student/dashboard`
- `/student/assessment`
- `/student/skills`
- `/student/recommendations`
- `/student/opportunities`
- `/student/opportunities/[id]`
- `/student/applications`
- `/student/portfolio`
- `/student/documents`
- `/student/profile`

## Authenticated Industry

- `/industry/dashboard`
- `/industry/profile`
- `/industry/opportunities`
- `/industry/opportunities/new`
- `/industry/opportunities/[id]`
- `/industry/opportunities/[id]/applicants`
- `/industry/programs`
- `/industry/applicants/[id]`

## Authenticated Academician

- `/academician/dashboard`
- `/academician/profile`
- `/academician/opportunities`
- `/academician/applications`

## Authenticated Institution Admin

- `/admin/dashboard`
- `/admin/students`
- `/admin/faculty`
- `/admin/skills`
- `/admin/analytics/skills`
- `/admin/analytics/internships`
- `/admin/analytics/placements`
- `/admin/opportunities`
- `/admin/reports`
- `/admin/verification`

---

# 6. LOCKED TECHNOLOGY STACK

The implementation stack is fixed for the MVP. Do not substitute alternatives unless explicitly requested.

## Frontend
- Next.js 16
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts
- React Hook Form where useful

## Backend
- Node.js
- Express
- TypeScript
- REST API

## Database
- Neon PostgreSQL
- Prisma ORM
- Redis for caching (Optional / managed Redis later)
- Local Docker: Not required
## Authentication
- JWT-based authentication
- bcrypt password hashing
- Role-based access control
- Google OAuth is optional and must not block the MVP

## Validation
- Zod

## File Storage
- S3-compatible object storage later
- Local storage is acceptable as a development/demo fallback
- Use a storage abstraction so provider-specific code stays isolated

## Recommendation Engine
- MVP: deterministic rule-based weighted scoring
- Stretch: cosine similarity using scikit-learn in a separate experimentation path
- Do not make Python/scikit-learn a core MVP dependency

## Analytics
- Recharts on frontend
- PostgreSQL aggregation queries on backend

## API Documentation
- OpenAPI/Swagger

## Testing
- Vitest
- Supertest

## Hosting
- Frontend: Vercel
- Backend: Render
- Neon PostgreSQL
- Managed Redis later
- S3-compatible object storage later

## Package Manager
- npm

## Architecture
Use a modular monolith for the hackathon. Do not create microservices for the MVP.

Suggested repository structure:

```text
academia-industry-portal/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   └── types/
├── backend/
│   └── src/
│       ├── modules/
│       │   ├── auth/
│       │   ├── users/
│       │   ├── students/
│       │   ├── academicians/
│       │   ├── industries/
│       │   ├── institutions/
│       │   ├── skills/
│       │   ├── assessments/
│       │   ├── matching/
│       │   ├── opportunities/
│       │   ├── applications/
│       │   ├── learning/
│       │   ├── portfolios/
│       │   ├── analytics/
│       │   ├── documents/
│       │   ├── notifications/
│       │   └── audit/
│       ├── middleware/
│       ├── config/
│       └── utils/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── docs/
└── ...
```

# 6. DESIGN DIRECTION

Use Stitch to generate the visual system and page designs, then implement the approved designs in Antigravity.

The UI should feel like a modern institutional career-tech platform rather than a generic admin dashboard.

## Design principles

- Clean, professional, trustworthy.
- Modern but not flashy.
- Strong visual hierarchy.
- Excellent dashboard information density without clutter.
- Responsive desktop/mobile web.
- Accessible controls and readable charts.
- Consistent cards, badges, status chips, forms, tables and empty states.
- Skill data should be visually prominent.
- Match percentage should be immediately understandable.
- Avoid excessive gradients, glassmorphism, or decorative UI that reduces usability.

## Key visual components

- Role-specific sidebar/navigation
- Top navigation with profile and notifications
- KPI cards
- Skill bars/radar visualization
- Skill-gap cards
- Match score badge
- Matched vs missing skill chips
- Opportunity cards
- Search/filter controls
- Application pipeline/status chips
- Data tables
- Charts
- Portfolio timeline
- Verification badges
- Empty/loading/error states
- Confirmation dialogs
- Toast notifications

Stitch-generated UI should be treated as a design source, not as permission to change product behavior.

---

# 8. STUDENT EXPERIENCE

## 7.1 Onboarding

Flow:

Registration
→ select Student
→ institution
→ department
→ academic year
→ interests/target roles
→ initial profile
→ assessment prompt

The student should understand why the assessment matters.

## 7.2 Skill Assessment

Assessment supports:
- technical skills;
- soft skills;
- self-rated proficiency;
- optional domain aptitude/technical micro-tests.

MVP implementation can use:
- predefined questions;
- 1–5 proficiency scale;
- MCQs;
- domain-specific scoring.

Assessment result must produce:
- overall readiness indicator;
- skill scores;
- strongest skills;
- top 3–5 gaps;
- target-role comparison.

## 7.3 Skill Profile

Display:
- skill category;
- score;
- proficiency;
- industry benchmark where available;
- gap;
- last assessed date.

Example:

Python: 85
SQL: 72
Git: 70
REST APIs: 35

If target role requires REST APIs at 65:
Gap = 30 points.

## 7.4 Recommendations

Every recommendation should explain why it appears.

Example:

Software Development Intern
Match: 78%

Matched:
- Python
- SQL
- Git

Missing:
- REST APIs

Recommended learning:
- REST API Design Fundamentals

Do not display opaque AI claims.

## 7.5 Opportunities

Student can:
- search;
- filter by type;
- filter by skills;
- filter by location;
- filter remote/on-site;
- view duration;
- view stipend/CTC where available;
- see match percentage;
- open details;
- apply.

## 7.6 Application

Application should support:
- resume;
- portfolio link;
- basic profile;
- relevant skill summary.

Application states:

Applied
→ Shortlisted
→ Interview
→ Offered / Rejected

The student must see status history.

## 7.7 Portfolio

Portfolio aggregates:
- skills;
- verified certifications;
- completed internships;
- projects;
- achievements.

Each item should show:
- title;
- description;
- date;
- verification state.

States:
- Self-reported
- Pending verification
- Verified

Provide a shareable view-only portfolio page.

---

# 9. INDUSTRY EXPERIENCE

## 8.1 Dashboard

Show:
- active postings;
- total applicants;
- shortlisted;
- interviews;
- offers;
- recent applicants;
- top skill demand.

## 8.2 Opportunity creation

Required fields:

- title
- description
- type
- required skills
- skill importance/weight
- eligibility
- duration
- stipend/CTC
- location
- remote/hybrid/on-site
- application deadline
- organization

Types:
- Internship
- Apprenticeship
- Job

## 8.3 Applicant ranking

Rank applicants by:
- skill match;
- eligibility;
- optional profile signals.

Applicant card should show:
- name;
- department/year;
- match percentage;
- matched skills;
- missing skills;
- portfolio;
- application status.

Industry must not be forced to manually inspect every resume to understand basic skill compatibility.

## 8.4 Status management

Recruiter can update:
Applied
→ Shortlisted
→ Interview
→ Offered
or
Rejected

All status changes should be timestamped.

---

# 10. INDUSTRY LEARNING PROGRAMS

Industry can publish:
- training programs;
- workshops;
- certification courses;
- mentorship slots.

Minimum fields:
- title;
- description;
- skills covered;
- provider;
- duration;
- mode;
- link or enrollment action;
- completion/verification state.

Student can:
- view;
- register interest/enroll where supported;
- see how the program addresses skill gaps.

---

# 11. ACADEMICIAN EXPERIENCE

Academician profile:
- name;
- institution;
- department;
- expertise;
- years/experience if supplied;
- research areas;
- consultancy areas.

Opportunity types:
- Faculty Internship
- Industrial Training
- FDP
- Consultancy
- Research Collaboration

Academician can:
- browse;
- filter by domain;
- view details;
- apply/express interest;
- track status.

Industry can discover relevant academic expertise for consultancy/research pairing.

---

# 12. INSTITUTION ADMIN EXPERIENCE

## Dashboard

Core KPIs:
- total students;
- assessment completion;
- average readiness;
- internship participation;
- applications;
- interviews;
- offers;
- placement conversion.

## Skill analytics

Show:
- department/program skill-gap heatmap;
- most common skill gaps;
- strongest skills;
- emerging/in-demand skills;
- department comparison.

## Internship/placement analytics

Show funnel:

Eligible
→ Applications
→ Shortlisted
→ Interviews
→ Offers

Calculate conversion rates.

## Reports

Support exportable:
- CSV;
- PDF if implementation time permits.

Reports should be suitable for administrative/accreditation use.

---

# 13. SKILL TAXONOMY

The taxonomy is shared by:
- assessments;
- student profiles;
- target roles;
- opportunities;
- recommendations;
- analytics.

Initial demo should focus on 2–3 domains rather than attempting every academic discipline.

Suggested seeded domains:
- Computer Science / IT
- Mechanical
- optionally Electronics

Each skill should support:
- id;
- name;
- category;
- domain;
- related roles;
- normalized identifier.

Examples for CSE:
- Python
- Java
- JavaScript
- SQL
- Git
- REST APIs
- React
- Node.js
- Data Structures
- Problem Solving
- Communication
- Teamwork

---

# 14. MATCHING ENGINE

## 13.1 Input

Student skill vector:
`skill -> proficiency score`

Opportunity requirement:
`skill -> required importance/weight`

## 13.2 MVP formula

Use a weighted similarity model.

For each required skill:

normalized student score = student proficiency / 5

skill contribution =
normalized student score × skill weight

Overall match =
sum of contributions / sum of required skill weights × 100

Eligibility filters should run before ranking where applicable.

## 13.3 Output

Return:

- overall match percentage;
- matched skills;
- partially matched skills;
- missing skills;
- learning recommendations.

Example:

Required:
Python 0.4
SQL 0.3
REST API 0.2
Git 0.1

Student:
Python 4.5/5
SQL 3.8/5
REST API 1.5/5
Git 4/5

Result:
- Match ≈ computed weighted score
- Strong: Python, Git
- Moderate: SQL
- Gap: REST API

The exact calculation must be deterministic.

## 13.4 Candidate ranking

For an opportunity:
1. Filter by eligibility.
2. Calculate match.
3. Sort descending.
4. Display match explanation.

## 13.5 Student recommendation ranking

For a student:
1. Filter active opportunities.
2. Calculate match.
3. Rank by match.
4. Consider target role/interest.
5. Surface top N.

---

# 15. LEARNING RECOMMENDATION LOGIC

For every major missing skill:
1. Identify skill gap.
2. Search curated learning-resource dataset.
3. Recommend relevant resource.
4. Explain:
   `Recommended because you are missing REST APIs for your target role.`

MVP can use curated links/data rather than integrating a complete LMS.

---

# 16. DATABASE MODEL

Minimum entities:

## User
- id
- role
- name
- email
- password/auth provider
- institution_id
- organization_id
- verification status
- created_at
- updated_at

## Organization
- id
- type: industry/institution
- name
- domain/email
- verified_flag
- created_at

## StudentProfile
- user_id
- department
- year
- target_roles
- interests
- skill_vector

## AcademicProfile
- user_id
- institution
- department
- expertise
- research_areas
- consultancy_areas

## SkillTaxonomy
- id
- name
- category
- domain
- related_roles

## Assessment
- id
- user_id
- domain
- started_at
- completed_at
- score

## AssessmentQuestion
- id
- domain
- skill_id
- type
- question
- options
- correct_answer
- weight

## AssessmentResponse
- id
- assessment_id
- question_id
- response
- score

## Opportunity
- id
- organization_id
- type
- title
- description
- required_skills
- eligibility
- duration
- compensation
- location
- work_mode
- deadline
- status
- created_at

## Application
- id
- opportunity_id
- student_id
- status
- resume_document_id
- portfolio_url
- applied_at
- updated_at

## ApplicationStatusHistory
- id
- application_id
- old_status
- new_status
- changed_by
- changed_at

## LearningResource
- id
- title
- provider
- skills
- description
- url
- duration
- type

## PortfolioItem
- id
- student_id
- type
- title
- description
- date
- document_id
- verification_status
- verified_by
- verified_at

## Document
- id
- owner_id
- type
- filename
- storage_key
- access_policy
- created_at

## Notification
- id
- user_id
- type
- payload
- read_flag
- created_at

## AuditLog
- id
- actor_id
- action
- entity_type
- entity_id
- metadata
- created_at

---

# 17. DATA RELATIONSHIPS

User:
- belongs to Institution or Organization where applicable;
- has one role-specific profile.

Student:
- has many assessments;
- has many applications;
- has many portfolio items;
- has many documents.

Organization:
- has many opportunities;
- has many learning programs.

Opportunity:
- has many applications.

Application:
- belongs to one student;
- belongs to one opportunity;
- has many status-history records.

Skill:
- connects assessment questions, student scores, opportunities, roles, and learning resources.

---

# 18. API CONTRACTS

The exact framework may vary, but APIs should expose equivalent functionality.

## Auth
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/logout`
- GET `/api/auth/me`

## Student
- GET `/api/student/profile`
- PUT `/api/student/profile`
- POST `/api/student/assessment/start`
- GET `/api/student/assessment/:id`
- POST `/api/student/assessment/:id/submit`
- GET `/api/student/skills`
- GET `/api/student/gaps`
- GET `/api/student/recommendations`
- GET `/api/student/opportunities`
- GET `/api/student/opportunities/:id`
- POST `/api/student/opportunities/:id/apply`
- GET `/api/student/applications`
- GET `/api/student/portfolio`

## Industry
- GET `/api/industry/profile`
- PUT `/api/industry/profile`
- POST `/api/industry/opportunities`
- GET `/api/industry/opportunities`
- GET `/api/industry/opportunities/:id`
- GET `/api/industry/opportunities/:id/applicants`
- PATCH `/api/industry/applications/:id/status`
- POST `/api/industry/programs`

## Academician
- GET `/api/academician/profile`
- PUT `/api/academician/profile`
- GET `/api/academician/opportunities`
- POST `/api/academician/opportunities/:id/apply`
- GET `/api/academician/applications`

## Admin
- GET `/api/admin/dashboard`
- GET `/api/admin/analytics/skills`
- GET `/api/admin/analytics/internships`
- GET `/api/admin/analytics/placements`
- POST `/api/admin/onboard/csv`
- GET `/api/admin/reports`
- PATCH `/api/admin/portfolio/:id/verify`

API naming can be adapted to the selected framework, but behavior must remain equivalent.

---

# 19. SECURITY REQUIREMENTS

Minimum implementation:

- password hashing;
- secure session/JWT handling;
- RBAC on every protected API;
- server-side authorization;
- input validation;
- file-type/size validation;
- access-controlled document retrieval;
- no sensitive data exposed through public APIs;
- audit logs for important admin/recruiter actions;
- environment variables for secrets;
- no secrets committed to source control.

Do not rely only on frontend route protection.

---

# 20. FILE/DOCUMENT HANDLING

Supported MVP documents:
- resume;
- certificate;
- internship completion letter;
- relevant academic records where required.

Each document needs:
- owner;
- type;
- storage reference;
- access policy;
- upload timestamp.

Public student portfolio must not expose private documents unless explicitly intended.

---

# 21. NOTIFICATIONS

MVP:
- in-app notifications.

Examples:
- New matching opportunity
- Application shortlisted
- Interview stage
- Offer
- Rejection
- Deadline reminder

Email notifications can be added if time permits.

---

# 22. ANALYTICS DEFINITIONS

## Assessment completion rate

completed assessments / onboarded students × 100

## Average readiness

average of defined student readiness scores.

## Skill-gap prevalence

students with a defined gap in skill / assessed students × 100

## Application conversion

offers / applications × 100

## Shortlist conversion

shortlisted / applications × 100

## Placement conversion

offers / eligible students × 100

Analytics must be based on actual application/assessment records, not hard-coded dashboard numbers.

---

# 23. SEED DATA

The application must ship with realistic demo data.

Seed:
- at least 10–20 students;
- 3–5 industry organizations;
- multiple internship/job opportunities;
- learning resources;
- skill taxonomy;
- completed assessments;
- applications across multiple statuses;
- academician opportunities;
- institution data.

Create at least one polished demo account for each role.

Recommended demo storyline:

Student:
- medium skill profile;
- clear REST API/SQL/etc. gaps;
- several recommendations;
- one active application.

Industry:
- active backend internship;
- multiple applicants;
- ranked candidates.

Academician:
- expertise in a defined domain;
- relevant FDP/research opportunities.

Admin:
- enough data for meaningful charts and funnel analytics.

---

# 24. EMPTY, LOADING AND ERROR STATES

Every major page must support:

Loading:
- skeletons or meaningful loading indicators.

Empty:
- explain why there is no data;
- provide next action.

Error:
- human-readable message;
- retry action where applicable.

Examples:
- No recommendations yet → complete assessment.
- No applications → browse opportunities.
- No applicants → share the opportunity.
- No analytics → import/onboard data.

---

# 25. RESPONSIVE REQUIREMENTS

Desktop:
- optimized for dashboard use.

Tablet:
- usable navigation and charts.

Mobile:
- responsive cards;
- stacked forms;
- horizontal-scroll tables only where necessary;
- mobile-friendly assessment;
- mobile-friendly application tracking.

Do not build a separate native app for MVP.

---

# 26. ACCESSIBILITY

Aim for WCAG-AA principles:
- keyboard navigation;
- labels for form fields;
- sufficient contrast;
- accessible status indicators;
- charts with textual summaries;
- error messages associated with fields;
- no information conveyed by color alone.

---

# 27. IMPLEMENTATION PHASES

## Phase 0 — Project foundation

Deliver:
- repository;
- app shell;
- chosen stack;
- database;
- environment setup;
- linting/type checking;
- basic design system;
- seed infrastructure.

Acceptance:
- app runs locally;
- database connects;
- production build succeeds.

## Phase 1 — Authentication/RBAC

Deliver:
- registration;
- login;
- logout;
- role routing;
- protected pages;
- role-specific navigation.

Acceptance:
- each role can authenticate;
- users cannot access unauthorized modules.

## Phase 2 — Student assessment

Deliver:
- taxonomy;
- questions;
- assessment UI;
- scoring;
- student skill profile;
- skill-gap report.

Acceptance:
- seeded student can complete assessment;
- scores persist;
- gaps are deterministic.

## Phase 3 — Industry opportunities

Deliver:
- industry profile;
- create/edit/publish opportunity;
- required skills;
- student browse/search/filter.

Acceptance:
- recruiter can publish an internship;
- student can discover it.

## Phase 4 — Matching engine

Deliver:
- weighted skill matching;
- student recommendations;
- applicant ranking;
- match explanations.

Acceptance:
- same input produces same score;
- matched/missing skills are visible.

## Phase 5 — Applications

Deliver:
- apply;
- resume;
- portfolio link;
- application list;
- status pipeline;
- recruiter status management;
- status history.

Acceptance:
- complete Student → Apply → Recruiter → Shortlist → Student flow works.

## Phase 6 — Portfolio

Deliver:
- auto-population;
- projects/certifications/internships;
- verification state;
- shareable portfolio.

## Phase 7 — Institution analytics

Deliver:
- KPIs;
- skill-gap charts;
- demand trends;
- application funnel;
- placement funnel.

Acceptance:
- charts are generated from database records.

## Phase 8 — Academician module

Deliver:
- profile;
- expertise;
- opportunity board;
- applications/interests.

## Phase 9 — Polish

Deliver:
- notifications;
- error/empty states;
- responsive refinement;
- accessibility;
- security review;
- performance review;
- demo data;
- deployment.

---

# 28. DEFINITION OF DONE

A feature is not complete merely because its UI exists.

A feature is complete when:
- UI exists;
- backend logic exists;
- database persistence exists where needed;
- RBAC is enforced;
- validation exists;
- loading/empty/error states exist;
- happy path works;
- relevant edge cases are handled;
- no console/runtime errors remain;
- responsive behavior is acceptable;
- feature can be demonstrated from a clean login.

---

# 29. TESTING CHECKLIST

## Authentication
- valid login;
- invalid login;
- duplicate email;
- logout;
- unauthorized route access.

## Assessment
- incomplete assessment;
- completed assessment;
- score persistence;
- repeat assessment;
- gap calculation.

## Opportunities
- invalid posting;
- draft/published state;
- filtering;
- expired deadline;
- required skills.

## Matching
- no matching skills;
- partial match;
- strong match;
- missing skills;
- deterministic score.

## Applications
- duplicate application prevention;
- status transition;
- recruiter authorization;
- student visibility;
- status history.

## Portfolio
- self-reported item;
- verified item;
- unauthorized verification;
- public portfolio privacy.

## Admin
- analytics with no data;
- analytics with data;
- department filtering;
- report generation.

---

# 30. DEMO SCRIPT

The application should support a 5–7 minute judge demo.

Recommended sequence:

1. Login as student.
2. Complete/view assessment.
3. Show skill profile.
4. Show top skill gaps.
5. Show learning recommendations.
6. Show internship recommendations with match percentages.
7. Open an opportunity.
8. Show matched/missing skills.
9. Apply.
10. Switch to recruiter.
11. Show ranked applicants.
12. Shortlist candidate.
13. Switch back to student.
14. Show updated application status.
15. Open student portfolio.
16. Switch to institution admin.
17. Show skill-gap heatmap.
18. Show internship/placement funnel.
19. Show in-demand skills.

The demo should tell one coherent story rather than showing disconnected pages.

---

# 31. IMPLEMENTATION RULES FOR ANTIGRAVITY + GEMINI

The technology stack in Section 6 is locked. Do not switch from Next.js to plain React or from Express to another backend framework without explicit approval.

When coding:
- inspect existing code before modifying;
- implement one phase at a time;
- run build/typecheck after meaningful changes;
- fix errors before moving on;
- do not silently remove functionality;
- avoid unnecessary dependencies;
- reuse shared components;
- keep business logic separate from presentation;
- keep matching logic independently testable;
- keep seed data deterministic;
- never hard-code analytics that should be derived from data;
- never fake backend behavior behind static UI once the module is being implemented.

When a task is too large, split it into smaller implementation tasks.

---

# 32. STITCH WORKFLOW

Use Stitch primarily for:
1. design exploration;
2. dashboard layouts;
3. student assessment screens;
4. skill visualization;
5. opportunity cards/details;
6. recruiter applicant ranking;
7. institution analytics;
8. portfolio.

For every Stitch design:
- preserve the existing information architecture;
- preserve required fields;
- preserve role permissions;
- preserve states;
- implement responsive variants.

Do not allow a generated visual design to introduce unsupported product requirements.

---

# 33. RECOMMENDED BUILD ORDER

The highest-confidence build sequence is:

1. Foundation
2. Auth/RBAC
3. Design system
4. Student profile
5. Skill taxonomy
6. Assessment
7. Skill-gap engine
8. Industry opportunity CRUD
9. Matching engine
10. Student recommendations
11. Applications
12. Recruiter applicant ranking
13. Application status
14. Portfolio
15. Admin analytics
16. Academician module
17. Notifications
18. Security/access review
19. Responsive polish
20. Demo/seed-data validation
21. Deployment

---

# 34. FIRST IMPLEMENTATION PROMPT

Use this as the first Antigravity/Gemini coding instruction:

"Read VIBE_CODING_SPEC.md completely before changing code. The stack is locked: Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui for frontend; Node.js + Express + TypeScript for backend; PostgreSQL + Prisma; Redis; JWT + bcrypt; Zod; Recharts; S3-compatible storage; Vitest + Supertest. Build Phase 0 only: initialize the repository structure, configure frontend and backend, configure environment variables, create the base design system and application shell, establish Prisma schema/migration infrastructure, add deterministic seed infrastructure, and add lint/typecheck/build/test commands. Do not implement feature modules yet. At the end, verify frontend and backend start, database migration works, and build/typecheck/test commands pass. Report files changed, commands run, and remaining blockers."

After Phase 0 is verified, proceed to Phase 1 rather than asking the agent to build everything at once.

---

# 35. IMPORTANT PRODUCT CONSTRAINTS

The following are intentional decisions from the PRD and should not be expanded during MVP implementation:

- No full LMS.
- No payment gateway.
- No deep ATS integration.
- No native mobile application.
- No blockchain credential system.
- No mandatory advanced ML recommendation model.
- No requirement to cover every academic domain.
- No requirement for a microservice architecture during the hackathon.

The architecture should remain extensible, but implementation should favor a working modular MVP.

---

# 36. MVP SUCCESS CRITERIA

The MVP succeeds if a judge can clearly see:

1. A student can understand their current skills.
2. The system identifies meaningful industry-relevant gaps.
3. Those gaps lead to learning recommendations.
4. The student's skills produce explainable internship/job matches.
5. The student can apply.
6. The recruiter can see and rank candidates.
7. The application lifecycle can be tracked.
8. The student's portfolio accumulates evidence of progress.
9. The institution can see aggregated skill and placement readiness.
10. The whole flow works as one connected platform.

