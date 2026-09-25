# Career Guidance & Career Pathway (Phase 4)

## Architecture
The Career Guidance system is built as a deterministic, orchestration layer over the existing Skill Intelligence infrastructure. It reuses existing systems for Assessment, Learning Recommendations, Opportunities, and Portfolio Evidence, ensuring no duplicate functionality is created.

The architecture flows as:
**Student Profile (with StudentSkills from Assessments)** -> **Career Matching Engine** -> **Recommended Roles** -> **Career Pathway (Gaps, Learning, Opportunities, Evidence)**.

## Career-Role Taxonomy
We introduced two new models in the Prisma schema:
- `CareerRole`: Defines a target career (e.g., Frontend Developer, Data Scientist).
- `CareerRoleSkill`: Maps existing `SkillTaxonomy` records to a `CareerRole`, specifying a `requiredProficiency` and `weight`.

This avoids duplicate skill entries and integrates natively with the existing `SkillTaxonomy`.

## Scoring Formula & Recommendation Logic
The matching engine uses a deterministic, explainable weighted average formula.

For each required skill in a `CareerRole`:
```
skillMatch = min(studentProficiency / requiredProficiency, 1)
```

The overall career score is calculated as:
```
careerScore = (Σ(skillMatch × weight) / Σ(weight)) × 100
```
- Missing skills contribute 0 to their proficiency, heavily dragging down the score based on their weight.
- Student proficiencies exceeding the requirement are capped at 100% to prevent over-inflation of the score.
- Missing skills are sorted by severity `gapSeverity = (required - student) * weight`.

## Gap Calculation
Gaps are calculated in real-time by subtracting the student's proficiency from the required proficiency of the career role. 
The top 3 missing skills with the highest `gapSeverity` are highlighted as "Key Gaps" or "Top Improvement Areas".

## Pathway Flow
When a student selects a specific career role, the Career Pathway API orchestrates multiple systems:
1. **Current Skill Profile**: Evaluated against the role.
2. **Skill Gaps**: Top gaps are identified.
3. **Recommended Learning**: Reuses the existing `LearningResource` engine to find resources covering the missing skills.
4. **Relevant Opportunities**: Reuses the existing `Opportunity` engine to fetch published Internships, Jobs, Live Projects, and Innovation Challenges that require the skills relevant to the career role.
5. **Portfolio Evidence**: Queries the student's existing `PortfolioItem`, `Certificate`, `Internship`, and `ProjectWorkspace` records to prove career readiness.
6. **Career Readiness**: The calculated overall match percentage is displayed as the student's readiness metric.

## API Endpoints
All endpoints are secured and accessed via `/api/career-guidance`:
- `GET /roles` - Returns all available career roles.
- `GET /recommendations` - Returns scored career roles for the authenticated student.
- `GET /roles/:id` - Returns a single career role's details.
- `GET /roles/:id/gaps` - Returns the skill gaps for a specific role based on the student's profile.
- `GET /path/:roleId` - Orchestrates and returns the full Career Pathway (Gaps, Learning, Opportunities, Evidence).

## Security
- All private endpoints require authentication and enforce RBAC.
- `STUDENT` role is strictly enforced for recommendation and pathway endpoints to ensure that only the authenticated student can view their private skill analysis.
- The matching engine uses the securely authenticated `req.user.id` and cannot be bypassed via URL parameters.

## Seed Data
The database is seeded with 13 deterministic Career Roles, representing common tech careers (Frontend Developer, Backend Developer, Full Stack Developer, Data Analyst, Machine Learning Engineer, DevOps Engineer, Cloud Engineer, Database Developer, Software Developer, Data Scientist, QA/Test Engineer, Cybersecurity Analyst, UI/UX Developer). 

The seed script is idempotent: it uses `findFirst` to skip seeding if the roles already exist and uses `upsert` for `SkillTaxonomy` records to avoid duplication.

## Test Coverage
Backend tests (`src/__tests__/career-guidance.test.ts`) are implemented using Vitest.
Coverage includes:
- Unauthenticated requests returning 401.
- Authenticated requests correctly fetching the user's student skills.
- The matching logic correctly implementing the scoring formula: capping overqualified skills and treating missing skills as 0.
- Missing skill gap calculation severity sorting.
- The career pathway endpoint successfully combining the required relations.
