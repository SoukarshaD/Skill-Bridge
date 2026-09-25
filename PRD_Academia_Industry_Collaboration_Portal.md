# Product Requirements Document (PRD)
## Academia–Industry Collaboration Portal for Skill Mapping, Internships & Placements

**Prepared for:** Smart India Hackathon (SIH) 2026
**Document Version:** 1.0
**Status:** Draft for Hackathon Submission

---

## 1. Document Control

| Field | Detail |
|---|---|
| Problem Statement | Portal for Academia–Industry Collaboration for Skill Mapping, Internships and Placement |
| Category | Software |
| Target Users | Students, Academicians, Industry/Recruiters, Institutions (Admin) |
| Document Owner | Team [Team Name] |
| Last Updated | August 2026 |

---

## 2. Executive Summary

Academic institutions and industry currently operate in silos. Students lack visibility into which skills employers actually want; industries struggle to find job-ready candidates; academicians have little insight into industry internship, training, and collaboration opportunities that would keep their teaching current. This PRD defines a **centralized web-based portal** that connects these three stakeholder groups through skill assessment, skill-to-opportunity mapping, internship/placement management, and industry–academia collaboration tools — all backed by analytics dashboards for institutions.

The goal for the hackathon is to design and build a **working MVP** that demonstrates the core loop: *assess a student's skills → map gaps to industry demand → recommend and match internships/jobs/learning paths → track the pipeline end-to-end → give institutions visibility.*

---

## 3. Problem Statement (Restated)

1. Students don't know what skills the market wants, or how their current skills compare (the "skill gap" is invisible to them).
2. Industries can't efficiently discover, filter, and engage job-ready student talent, nor easily publish structured internship/training programs.
3. Academicians lack a channel to industry-side opportunities (FDPs, industrial training, consultancy, joint research) that would let them upskill and align curricula.
4. Institutions have no unified, data-driven view of student readiness, internship participation, and placement outcomes across departments.

---

## 4. Goals & Objectives

### 4.1 Primary Goals
- G1: Give every student a **data-backed skill profile** and a clear, personalized path to close gaps.
- G2: Give industry a **structured, filterable pipeline** of assessed, verified student talent.
- G3: Give academicians a **discoverable channel** to industry-facing opportunities.
- G4: Give institutions **real-time analytics** on skill development, internship, and placement outcomes.

### 4.2 Success Metrics (KPIs)
| Metric | Target (Post-MVP / Pilot) |
|---|---|
| Students completing skill assessment | 70% of onboarded students |
| Avg. skill-gap-to-recommendation time | < 5 seconds (real-time) |
| Internship/job postings per active industry partner | ≥ 3/month |
| Student-to-opportunity match acceptance rate | ≥ 25% |
| Institution dashboard weekly active usage | ≥ 60% of registered institution admins |
| Reduction in manual placement-cell effort (survey-based) | ≥ 30% |

---

## 5. Scope

### 5.1 In Scope (MVP for Hackathon)
- Role-based registration & authentication (Student, Academician, Industry, Institution Admin)
- Skill assessment questionnaire + auto-generated skill profile
- Skill-gap identification against a curated industry skill taxonomy
- Recommendation engine (rule-based/ML-lite) for internships, jobs, and learning resources
- Internship/Job posting module for industry
- Application & tracking workflow for students
- Digital portfolio (auto-populated from verified activity on platform)
- Academician opportunity board (FDPs, industrial training, consultancy, research collabs)
- Institution analytics dashboard (skill trends, internship/placement funnel)
- Basic secure document upload (resume, certificates)
- Notifications (in-app/email) for matches, application status changes

### 5.2 Out of Scope (Future Phases)
- Full LMS / course delivery (only links/integrations to external providers)
- Payment gateway for paid certifications
- Deep third-party ATS integrations
- Native mobile apps (responsive web only for MVP)
- Blockchain-based credential verification (nice-to-have, Phase 3)
- Multi-language localization (Phase 2)

---

## 6. User Personas

### 6.1 Student — "Riya, 3rd-year B.Tech CSE"
Wants to know if she's job-ready, what skills to learn next, and a simple way to find and apply to relevant internships without trawling ten different portals.

### 6.2 Industry HR/L&D — "Aman, Talent Acquisition Lead at a mid-size IT firm"
Wants a filtered pool of pre-assessed candidates matching specific skill sets, and a simple way to post internships/roles and publish training programs to build his talent funnel early.

### 6.3 Academician — "Dr. Mehta, Associate Professor"
Wants visibility into industrial training, FDPs, consultancy, and live-project opportunities to stay current and bring real-world context into teaching.

### 6.4 Institution Admin/TPO — "Placement Cell Officer"
Wants a single dashboard to track department-wise skill readiness, internship conversion, and placement outcomes instead of maintaining spreadsheets manually.

---

## 7. User Stories (Sample, by Module)

**Skill Assessment**
- As a student, I want to take a skill assessment so that I can see my strengths and gaps against industry benchmarks.
- As a student, I want personalized learning recommendations so I can close identified gaps.

**Internships & Placements**
- As an industry user, I want to post an internship with required skills so that the system surfaces it only to matching students.
- As a student, I want to apply to a recommended internship in one click and track its status.
- As a recruiter, I want to shortlist candidates by skill-match percentage rather than manually reading resumes.

**Academia Collaboration**
- As an academician, I want to browse industry-posted FDPs/consultancy opportunities filtered by my domain.
- As an academician, I want to propose a collaborative research project visible to interested industry partners.

**Institution Analytics**
- As a TPO, I want a dashboard showing skill-gap trends across departments so I can plan targeted training drives.
- As a TPO, I want to track applications → interviews → offers funnel in real time.

**Portfolio**
- As a student, I want a shareable digital portfolio link that auto-updates with verified certifications and completed internships.

---

## 8. Functional Requirements

### 8.1 Authentication & Role Management
- FR1.1: Multi-role signup/login (Student, Academician, Industry, Institution Admin) with email + institution/organization verification.
- FR1.2: Role-based access control (RBAC) governing visible modules and data.
- FR1.3: Institution admin can bulk-onboard students/faculty via CSV upload.

### 8.2 Skill Assessment & Profiling
- FR2.1: Configurable questionnaire covering technical skills (domain-specific), soft skills, and self-rated proficiency.
- FR2.2: Optional short aptitude/technical micro-tests per domain.
- FR2.3: System computes a **Skill Profile** (radar/bar visualization) scored against a curated **Industry Skill Taxonomy**.
- FR2.4: System highlights top 3–5 skill gaps relative to the student's chosen target roles/industries.
- FR2.5: Profile is re-computable as students complete more assessments, courses, or projects.

### 8.3 Skill Mapping & Recommendations
- FR3.1: Recommendation engine suggests: (a) matching job roles/industries, (b) relevant internships/jobs currently posted, (c) learning resources/certifications to close gaps.
- FR3.2: Matching uses a weighted skill-similarity score between student profile and opportunity requirements.
- FR3.3: Recommendations refresh automatically when new postings are added or profile changes.

### 8.4 Internship & Job Module
- FR4.1: Industry users can create postings (title, description, required skills, type — internship/apprenticeship/job, duration, stipend/CTC, location/remote).
- FR4.2: Students can browse, filter, search, and apply; application includes resume + auto-attached portfolio link.
- FR4.3: Application status pipeline: Applied → Shortlisted → Interview → Offered/Rejected, visible to both sides.
- FR4.4: Industry can shortlist/filter applicants by skill-match %, and view student skill profile before deciding.

### 8.5 Industry Learning Programs
- FR5.1: Industry can publish training programs, workshops, certification courses, mentorship slots.
- FR5.2: Students can enroll/register interest; enrollment reflects on their portfolio upon completion (self-declared or industry-verified).

### 8.6 Academician Collaboration Module
- FR6.1: Industry/institution can post: faculty internships, industrial training, FDPs, consultancy requests, joint research proposals.
- FR6.2: Academicians can browse/filter by domain, apply/express interest, and track status.
- FR6.3: Academicians can also list their own expertise areas to be discoverable by industry for consultancy/research pairing.

### 8.7 Digital Portfolio
- FR7.1: Auto-generated portfolio page per student aggregating: skill profile, verified certifications, completed internships, projects, achievements.
- FR7.2: Shareable public link (view-only) for use in job applications outside the platform.
- FR7.3: Verification badge for institution/industry-confirmed entries vs. self-reported entries.

### 8.8 Institution Analytics Dashboard
- FR8.1: Department/program-level skill-gap heatmaps.
- FR8.2: Internship & placement funnel analytics (applications, shortlists, offers, conversion rate).
- FR8.3: Exportable reports (CSV/PDF) for accreditation (NAAC/NBA) and administrative use.
- FR8.4: Trend view of most in-demand skills sourced from live industry postings.

### 8.9 Notifications & Communication
- FR9.1: In-app and email notifications for new matches, application status changes, deadlines.
- FR9.2: Basic messaging/query channel between industry and shortlisted students (Phase 2 candidate if time-constrained).

### 8.10 Document & Data Management
- FR10.1: Secure upload/storage of resumes, certificates, internship completion letters.
- FR10.2: Access-controlled document sharing (only visible to intended recipient role).

---

## 9. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Scalability | Should support multi-institution, multi-tenant use (architected so one deployment can serve many colleges) |
| Security | Role-based access control, encrypted storage for documents/PII, secure auth (JWT/OAuth2), input validation |
| Performance | Recommendation results returned in < 2–3 seconds for typical dataset sizes |
| Availability | Target 99% uptime for pilot deployment |
| Usability | Responsive design (mobile + desktop web); accessible (WCAG-AA aspirational) |
| Data Privacy | Compliance-minded design (aligned with India's DPDP Act principles) — consent-based data use, clear data retention policy |
| Auditability | Activity logs for postings, applications, and admin actions |
| Extensibility | Modular architecture to allow future LMS/ATS/credential-verification integrations |

---

## 10. Proposed System Architecture (High Level)

**Pattern:** Layered / modular monolith for hackathon speed, designed to be split into microservices later (Auth, Skill-Engine, Matching-Engine, Postings, Analytics).

```
Client (React/Next.js Web App, responsive)
        │
        ▼
API Gateway / Backend (Node.js+Express or Django/FastAPI)
        │
 ┌──────┼───────────────┬───────────────┬───────────────┐
 ▼      ▼                ▼               ▼               ▼
Auth   Skill Assessment  Matching/Reco   Postings &      Analytics
Service & Profiling Svc  Engine Service  Applications Svc Service
 │            │                │               │               │
 └────────────┴────────────────┴───────────────┴───────────────┘
                              │
                              ▼
                     PostgreSQL (relational core)
                     + Redis (caching/session)
                     + Object Storage (resumes/certs — S3-compatible)
                     + (Optional) Elasticsearch for search/filter at scale
```

**Recommended Tech Stack (hackathon-feasible):**
- Frontend: React.js / Next.js, Tailwind CSS
- Backend: Node.js (Express) or Python (FastAPI/Django)
- Database: PostgreSQL (structured data), Redis (caching)
- Recommendation Engine: Rule-based weighted scoring for MVP; scikit-learn (cosine similarity on skill vectors) as a stretch goal
- Auth: JWT-based, bcrypt password hashing, optional OAuth (Google) for quick sign-up
- File Storage: AWS S3 / Firebase Storage / local object storage for demo
- Hosting (demo): Vercel/Netlify (frontend) + Render/Railway/AWS (backend)
- Dashboards/Analytics: Chart.js / Recharts on frontend, aggregation queries on backend

---

## 11. Core Data Model (Simplified ER Overview)

**Entities:**
- `User` (id, role, name, email, institution/org_id, ...)
- `StudentProfile` (user_id, department, year, skill_vector, target_roles[])
- `SkillTaxonomy` (skill_id, name, category, related_roles[])
- `AssessmentResponse` (user_id, question_id, response, score)
- `Opportunity` (id, type[internship/job/training/FDP/research], posted_by_org_id, required_skills[], description, status)
- `Application` (id, student_id, opportunity_id, status, timestamp)
- `Portfolio` (student_id, verified_items[], self_reported_items[])
- `Organization` (id, type[industry/institution], name, verified_flag)
- `Notification` (id, user_id, type, payload, read_flag)

Relationships: Student ↔ AssessmentResponse (1-M) → StudentProfile (derived); Organization ↔ Opportunity (1-M); Student ↔ Application ↔ Opportunity (M-M via Application).

---

## 12. Recommendation/Matching Logic (MVP Approach)

1. Represent each student's skills and each opportunity's required skills as weighted vectors over the shared **Skill Taxonomy**.
2. Compute a **match score** = weighted overlap (e.g., cosine similarity or simple weighted Jaccard) between student vector and opportunity vector.
3. Rank opportunities per student (and candidates per opportunity) by match score descending.
4. Surface top-N recommendations with a visible "X% skill match" indicator and a breakdown of matched vs. missing skills.
5. Missing skills feed directly into the **learning recommendation** list (map each missing skill to a curated resource/course).

This keeps the MVP explainable and fast to build, while leaving a clear upgrade path to ML-based collaborative filtering later.

---

## 13. UX Flow (Key Journeys)

**Student Journey:** Sign up → Select department/interests → Complete skill assessment → View skill profile & gap report → Browse recommended internships/jobs/courses → Apply → Track application status → Portfolio auto-updates.

**Industry Journey:** Sign up & get verified → Post internship/job/training program → View ranked, skill-matched applicant pool → Shortlist/communicate → Update status → View hiring analytics.

**Academician Journey:** Sign up & verify institution affiliation → Set expertise domains → Browse FDPs/consultancy/research postings → Apply/express interest → Track status.

**Institution Admin Journey:** Bulk-onboard students/faculty → Monitor dashboard (skill trends, funnel) → Export reports.

---

## 14. MVP Prioritization (Hackathon Build Plan)

| Priority | Feature | Rationale |
|---|---|---|
| P0 | Auth + role-based dashboards | Foundation for everything |
| P0 | Skill assessment + profile generation | Core differentiator, needed to demo the "gap" story |
| P0 | Opportunity posting (industry) + browsing/applying (student) | Core transactional loop |
| P0 | Matching/recommendation engine (rule-based) | Ties skill data to opportunities — the "wow" factor |
| P1 | Application status tracking | Completes the loop, easy to demo |
| P1 | Institution analytics dashboard (basic charts) | Strong differentiator for judges, moderate effort |
| P1 | Digital portfolio page | High visual/demo impact |
| P2 | Academician collaboration board | Important for full problem-statement coverage, can be simplified UI |
| P2 | Notifications | Nice UX polish |
| P3 | Verified-credential badges, messaging, learning program enrollment tracking | Stretch goals if time permits |

---

## 15. Assumptions & Constraints

- Institutions will provide/validate a base list of departments and an initial skill taxonomy per domain.
- Industry postings are self-declared; verification of company legitimacy is basic (domain email/manual admin approval) for MVP.
- Internet connectivity and browser access assumed for all user types (mobile-responsive web, not offline-first).
- Hackathon demo will use seeded/sample data for students, industries, and postings.

---

## 16. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Skill taxonomy too generic to feel personalized | Weak demo impact | Curate a focused taxonomy for 2–3 domains (e.g., CSE, Mechanical) for the demo rather than trying to cover all fields |
| Cold-start problem (no postings/assessments yet) | Empty-state UX looks broken | Pre-seed realistic demo data for industries, opportunities, and student profiles |
| Scope creep across 4 user roles | Incomplete MVP | Strictly follow P0/P1 prioritization in Section 14; keep academician module UI minimal |
| Data privacy concerns with resumes/PII | Trust/compliance issue | Apply basic encryption, access control, and a clear consent screen even in MVP |
| Recommendation engine feels like a "black box" | Judges may question logic | Always show the matched/missing skill breakdown transparently |

---

## 17. Future Roadmap (Post-Hackathon)

- **Phase 2:** ML-based recommendation (collaborative filtering), verified credential system, multi-language support, in-platform messaging, mobile app.
- **Phase 3:** Blockchain/DigiLocker-style credential verification, integration with national skilling initiatives (e.g., Skill India, NCS), deeper analytics for policymakers, LMS integrations, employer branding pages.

---

## 18. Appendix

### 18.1 Sample Skill Assessment Question Types
- Self-rated proficiency (1–5 scale) across a role-relevant skill list
- Scenario-based technical MCQs per domain
- Soft-skill situational judgment questions (communication, teamwork, problem-solving)

### 18.2 Sample Skill Match Output (Illustrative)
```
Opportunity: "Software Development Intern – Backend"
Required Skills: Python (High), SQL (Medium), REST APIs (Medium), Git (Low)

Student Match: 78%
Matched: Python, SQL, Git
Gap: REST APIs → Recommended: "REST API Design Fundamentals" (linked course)
```

### 18.3 Glossary
- **FDP:** Faculty Development Program
- **TPO:** Training & Placement Officer
- **RBAC:** Role-Based Access Control
- **NAAC/NBA:** Indian higher-education accreditation bodies

---

*End of Document*
