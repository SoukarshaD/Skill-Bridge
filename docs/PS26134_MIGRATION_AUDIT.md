# PS 26134 Migration Audit

## Overview
This document audits the codebase migration from the original SIH Problem Statement (Internships & Placements) to **PS 26134: Challenges in aligning skill development programs with industry requirements and emerging job market demands.**

---

## 1. Preserve (Shared Infrastructure)
These modules provide the foundational architecture and must be preserved completely.

- **Authentication & Security**
  - **Models**: `User`
  - **Backend**: `auth/*`, `users/*`, JWT handling, HttpOnly cookies, RBAC (`role` enum).
  - **Frontend**: `useAuth`, `ProtectedRoute`, `lib/api.ts`.
- **Database & Prisma**
  - **Models**: Neon PostgreSQL connection, `schema.prisma` base configuration.
- **Documents & Files**
  - **Models**: `Document`
  - **Backend**: `documents/*` (AWS/S3 structure for safe storage).
  - **Frontend**: Document upload components.
- **Notifications**
  - **Models**: `Notification`
  - **Backend**: `notifications/*`
- **Core Skill Taxonomy**
  - **Models**: `SkillTaxonomy`
  - **Backend**: `skills/*`
  - **Rework Needed**: None, the taxonomy is central to both PS.

---

## 2. Rework (Core for PS 26134)
These modules directly address the new PS and need to be adapted to focus on *skill development programs*, *industry curriculum alignment*, and *identifying skill gaps*.

### Institutional Analytics & Skill Gaps
- **Purpose**: Previously tracked placements. Must now track how academic curriculum aligns with industry trends.
- **Models**: Relies on `StudentSkill`, `CareerRoleSkill`, `Organization`.
- **Backend**: `analytics/*`
- **Frontend**: `admin/dashboard`, `industry/dashboard`
- **Action**: Rework to emphasize "Curriculum vs Industry Demand" dashboards.

### Skill Assessments
- **Purpose**: Crucial for identifying the gap.
- **Models**: `Assessment`, `AssessmentQuestion`, `AssessmentAttempt`, `AssessmentResponse`, `StudentSkill`.
- **Backend**: `assessments/*`
- **Frontend**: `student/assessment/*`
- **Action**: Rework wording from "Interview Prep" to "Industry Alignment Diagnostics". 

### Career Guidance (Skill Alignment)
- **Purpose**: Previously helped students find jobs. Must now focus on mapping current skills to emerging demands.
- **Models**: `CareerRole`, `CareerRoleSkill`.
- **Backend**: `career-guidance/*`
- **Frontend**: `student/career/*`
- **Action**: Refocus as "Emerging Job Market Pathway Generator".

### Programs (FDPs, Workshops) & Learning
- **Purpose**: These *are* the "skill development programs" mentioned in PS 26134.
- **Models**: `Program`, `ProgramRegistration`, `LearningResource`.
- **Backend**: `programs/*`, `learning/*`
- **Frontend**: `academician/programs/*`, `student/learning/*`
- **Action**: Upgrade to be the primary solution for bridging the identified skill gaps.

### Professional Engagement (Academicians & Collaborations)
- **Purpose**: Industry collaborating with academia to align curriculums.
- **Models**: `AcademicProfile`, `Collaboration`.
- **Backend**: `collaborations/*`, `academicians/*`
- **Frontend**: `academician/collaborations/*`, `industry/academicians/*`
- **Action**: Rework proposals to specifically target "Curriculum Redesign" and "Joint Skill Programs".

---

## 3. Secondary Features
These features support the skill development ecosystem practically but are not the primary focal point of curriculum alignment. They should be kept as supplementary tools.

### Challenges & Live Projects
- **Models**: `Challenge`, `ProjectWorkspace`.
- **Backend**: `challenges/*`, `projects/*`
- **Frontend**: `student/challenges/*`, `student/projects/*`
- **Status**: Safe to keep as "Practical Skill Alignment Applications."

### Mentorship
- **Models**: `MentorshipProgram`, `Mentorship`.
- **Backend**: `mentorship/*`
- **Frontend**: `student/mentorship/*`, `industry/mentorship/*`
- **Status**: Safe to keep as a secondary student-support feature.

### Portfolio & Certifications
- **Models**: `PortfolioItem`, `Certificate`.
- **Backend**: `portfolios/*`, `certificates/*`
- **Frontend**: `student/portfolio/*`, `student/certifications/*`
- **Status**: Safe to keep as evidence of skill development.

---

## 4. Remove Later
These modules are remnants of the old "Placement & Recruitment" focus and distract from the core goal of PS 26134.

### Traditional Recruitment / Applicant Tracking (ATS)
- **Models**: `Opportunity` (specifically `JOB` types), `Application` (status pipelines: SHORTLISTED, OFFERED).
- **Backend**: `applications/*`, parts of `opportunities/*`.
- **Frontend**: Kanban applicant tracking boards in `industry/opportunities/[id]/applicants`.
- **Action**: Mark for later removal or severe simplification. The platform is not a job board anymore.

### Traditional Internships Workflow
- **Models**: `Internship`, `InternshipProgressUpdate`.
- **Backend**: `internships/*`
- **Frontend**: `industry/internships/*`, `student/internships/*`
- **Action**: While internships can be a *result* of skill development, having a massive standalone lifecycle tracking module distracts from the core PS. Condense or remove later.

---

## 5. Recommended Removal Order
When the time comes to clean up the repository for PS 26134:
1. Deprecate the Applicant Tracking (Kanban) UI in Industry dashboard.
2. Remove `Application` state machine tracking for Jobs.
3. Clean up the `Internship` milestone tracking module, replacing it with a simple "Applied" status if necessary.
4. Strip pure "Job" endpoints from `opportunities.controller.ts`.
5. Remove purely placement-focused metrics from `analytics.controller.ts` (e.g., "Accepted Offers"), replacing them with "Skills Acquired".

## 6. Potentially Dangerous Deletions
- **Do not delete `Opportunity` model entirely.** It is currently polymorphically tied to Apprenticeships, Research, and Consultancy which are still needed for Academician collaboration.
- **Do not delete `StudentProfile` targeting.** Even though we are removing "Jobs", target roles are required by the `Career Guidance` gap analysis engine.
