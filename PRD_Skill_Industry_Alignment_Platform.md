# Product Requirements Document

## Setu-Kaushal — Labour-Market Intelligence & Curriculum-Alignment Platform

**SIH 2026 Problem Statement:** Challenges in aligning skill-development programmes with industry requirements and emerging job market demands
**Document version:** 1.0
**Prepared for:** Smart India Hackathon 2026 submission

---

## 1. Executive Summary

India's skill-development ecosystem trains lakhs of candidates every year, but courses are often designed around broad, historical occupation categories that lag the pace of technology, local industry demand, and employer expectations. The result is a persistent mismatch: employers cannot find job-ready candidates, trainees complete courses with limited placement potential, and course revision happens too slowly and too centrally to track fast-moving sectors (EV servicing, AI-adjacent roles, green-energy trades, etc.).

**Setu-Kaushal** ("Bridge of Skill") is a labour-market intelligence and curriculum-alignment platform that continuously ingests real-world demand signals — job postings, employer surveys, industry consultations, sector growth data, and placement outcomes — and turns them into concrete, evidence-based recommendations: which skills are in demand where, which courses/qualifications map to them, which courses are obsolete or oversupplied, and what a district's training plan should prioritize next quarter. It closes the loop between what industry needs today and what training centers teach today, rather than relying on periodic, manual curriculum reviews.

**Core value proposition:** *Turn labour-market signals into a living, evidence-based training plan — automatically, continuously, at district granularity.*

---

## 2. Problem Restatement

| Barrier | Effect |
|---|---|
| Curricula built on broad/historical occupation categories (e.g., legacy NCO/NSQF codes) | Courses don't reflect current job roles, tools, or productivity standards |
| No continuous feedback loop from employers to training providers | Curriculum revision is slow, reactive, and centralized |
| Trainer capacity and equipment lag emerging tech (e.g., EV, automation, AI-adjacent trades) | Graduates trained on outdated tools/processes |
| No systematic way to detect demand by role × skill × location × proficiency level | Training capacity planning is guesswork, not evidence |
| No mechanism to flag oversupplied or obsolete courses | Public/private training spend continues on low-placement courses |
| Fragmented data across NCS, EPFO, e-Shram, sector skill councils, employer job boards | No single source of truth for labour-market demand |

**Root cause:** skill-development *supply* (courses, capacity, curricula) and labour-market *demand* (roles, skills, locations) are planned and reported through disconnected systems with no continuous, evidence-based feedback loop between them. Setu-Kaushal exists to be that loop.

---

## 3. Goals & Success Metrics (KPIs)

### 3.1 Impact Goals (aligned to problem statement)
- Stronger placement rates for skill-development programme graduates
- Reduced skill mismatch between course output and employer demand
- Improved employer satisfaction with candidate job-readiness
- Timely, evidence-triggered course revision instead of periodic manual review
- Better-informed equipment and trainer capacity planning
- Clearer, data-backed career pathways for candidates

### 3.2 Product KPIs

| Metric | Target (Year 1 post-launch) |
|---|---|
| Time from demand-signal detection to curriculum-update recommendation | < 30 days (vs. typical multi-year cycles today) |
| % of active courses mapped to a live demand score | > 90% of courses in participating states |
| Skill-gap coverage (roles tracked with demand + supply data) | 200+ job roles across 10+ sectors at pilot launch |
| Employer validation participation rate | > 50% of registered employers respond to at least one quarterly validation survey |
| District training plans generated per quarter | 100% of onboarded districts |
| Placement rate uplift for courses revised via platform recommendations | +15% within 2 cohorts of revision |
| Number of obsolete/oversupplied courses flagged and acted upon | Tracked quarterly, trending downward after Year 1 |

### 3.3 Hackathon Demo Success Criteria
- Live demo: ingest a sample set of job postings + employer survey responses for one sector/region → generate a ranked skill-gap report with course-mapping recommendations in real time
- Working district-level training-plan generator for at least one demo district
- Employer-validation workflow (survey → aggregated signal → dashboard update)
- Explainable "why this course is flagged obsolete/oversupplied" reasoning, not a black-box score

---

## 4. User Personas

### 4.1 Skill-Development Institution / Training Provider Administrator (Primary)
Runs a government or private ITI/skill center delivering NSQF-aligned courses. Needs to decide which courses to run next cycle, what equipment/trainers to invest in, and which existing courses to retire or revise.
**Needs:** ranked, evidence-backed course recommendations for their region/sector; early warning on obsolete courses; trainer/equipment gap reports.

### 4.2 Employer / Industry HR (Demand Source & Validator)
Represents companies hiring for skilled roles (manufacturing, retail, EV, IT-enabled services, etc.). Struggles to find job-ready candidates and wants influence over what's taught.
**Needs:** low-effort way to signal real hiring needs (job postings + periodic surveys); visibility into which training providers are producing job-ready candidates; direct channel to validate/comment on proposed curriculum changes.

### 4.3 Trainee / Candidate (End Beneficiary)
Prospective or current trainee choosing a course, often in a district with multiple training options.
**Needs:** clear, current information on which courses lead to jobs, in which locations, at what proficiency/pay level — a data-backed career pathway, not a static course catalog.

### 4.4 Government Scheme Administrator / Sector Skill Council (SSC) Official
State skill mission officer, NSDC/NCVET-affiliated sector skill council representative, or district skill committee member responsible for capacity planning and qualification standards.
**Needs:** district- and sector-level dashboards, exportable training plans, qualification-to-skill mapping tools, aggregate placement/outcome analytics for scheme reporting.

---

## 5. Scope: MVP vs. Future Phases (P0–P3)

| Priority | Feature | Phase |
|---|---|---|
| P0 | Demand-signal ingestion: job postings (scraped/API) + structured employer survey tool | MVP |
| P0 | Skill-gap engine: demand by role × skill × location × proficiency level | MVP |
| P0 | Course-to-skill mapping against existing qualification/course catalog (NSQF-aligned) | MVP |
| P0 | Obsolete/oversupplied course flagging with explainable rationale | MVP |
| P0 | District-level training-plan generator (exportable report) | MVP |
| P1 | Employer validation workflow (review/comment/endorse proposed curriculum changes) | MVP-adjacent (stub for demo) |
| P1 | Placement-outcome ingestion and feedback loop (course → placement rate → re-scoring) | Phase 2 |
| P1 | Candidate-facing career-pathway explorer (course → role → demand → pay band) | Phase 2 |
| P2 | Trainer capability/certification gap tracker tied to curriculum updates | Phase 2 |
| P2 | Equipment/infrastructure gap planner (cost-aware capacity recommendations) | Phase 2 |
| P2 | Integration with National Career Service (NCS), e-Shram, EPFO signals for richer demand data | Phase 2–3 |
| P3 | Predictive demand forecasting (12–24 month horizon) for emerging technologies/sectors | Phase 3 |
| P3 | Auto-drafted curriculum module suggestions (not just gap flags) using generative AI, reviewed by SSC before publishing | Phase 3 |
| P3 | Cross-state benchmarking and best-practice course-transplant recommendations | Phase 3 |

---

## 6. Functional Requirements

### 6.1 Demand-Signal Ingestion (P0)
- FR1.1: Connector layer to ingest job postings from public job portals/APIs (structured or scraped), tagged by role, required skills, location, and experience/proficiency level
- FR1.2: Structured employer survey builder — periodic (quarterly) short surveys asking employers to rate hiring difficulty, emerging skill needs, and satisfaction with recent hires by training source
- FR1.3: Industry-consultation capture tool — structured intake form for sector skill council consultations, workshops, and expert panels, so qualitative input feeds the same pipeline as quantitative signals
- FR1.4: Sector growth data ingestion (published government/industry sector reports) as a macro-trend overlay
- FR1.5: Placement outcome ingestion from training providers (course → # trained → # placed → role → salary band)
- FR1.6: Data-source confidence weighting — each signal type (job posting, survey, consultation, sector report) is weighted and its weighting shown, not silently blended

### 6.2 Skill-Gap Engine (P0)
- FR2.1: Normalize incoming demand signals into a controlled skill taxonomy (mapped to NSQF/NCO-aligned qualification packs where possible, extensible for emerging skills not yet formally coded)
- FR2.2: Compute demand scores by role × skill × district/region × proficiency level, updated on a rolling basis (not a one-time snapshot)
- FR2.3: Compute supply scores from active course enrollment/output data at participating training providers
- FR2.4: Gap score = demand − supply, surfaced with a plain-language explanation of contributing signals (e.g., "42 open postings requiring EV battery diagnostics in this district in the last 90 days; 0 active courses covering this module")

### 6.3 Course-to-Curriculum Alignment (P0)
- FR3.1: Map existing course catalog entries to the skill taxonomy so each course has a machine-readable skill-coverage profile
- FR3.2: Recommend curriculum updates where a course's skill coverage has drifted from current demand (e.g., "Add 2 modules: EV charging infrastructure, battery diagnostics")
- FR3.3: Flag obsolete courses (persistently low/declining demand + low placement rate) and oversupplied courses (high enrollment relative to regional demand) with the specific signals behind each flag
- FR3.4: Recommend new course creation where a high-demand skill cluster has no mapped course at all

### 6.4 District-Level Training Plan Generator (P0)
- FR4.1: Generate a structured, exportable (PDF/CSV) district training plan: priority roles/skills, recommended course additions/revisions/retirements, estimated capacity needed, and supporting evidence
- FR4.2: Plans refresh on a defined cadence (e.g., quarterly) and version history is retained so administrators can see what changed and why

### 6.5 Employer Validation Workflow
- FR5.1: Employers can review AI-proposed curriculum changes relevant to their sector and endorse, comment, or dispute them before they're finalized in a district plan
- FR5.2: Employer endorsement strength feeds back into the confidence weighting of future recommendations for that sector/region

### 6.6 Candidate Career Pathway (Phase 2, stubbed for demo)
- FR6.1: Given a district and interest area, show ranked courses with current demand score, indicative placement rate, and typical proficiency/pay progression

---

## 7. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Explainability** | Every gap flag, obsolescence flag, and recommendation must show its contributing signals and their weights — no unexplained black-box scores, consistent with the platform's design principle of interpretability over opacity |
| **Data governance** | Clear provenance and confidence tagging per data source; auditable trail from raw signal → aggregated score → recommendation |
| **Freshness** | Demand/supply scores recompute on a rolling basis (target: weekly refresh for job-posting signals, quarterly for survey/consultation signals) |
| **Scalability** | Must scale from a pilot (few districts/sectors) to national coverage (all states, NSQF-aligned sectors) without architectural rework |
| **Interoperability** | Designed to integrate with existing government data sources (National Career Service, e-Shram, EPFO, NCVET qualification registries, sector skill council data) via adapter pattern rather than tight coupling |
| **Usability** | Dashboards must be usable by non-technical training-institution administrators and government officials — visual, filterable, exportable, not requiring data-science literacy |
| **Privacy** | Employer and candidate data handled per DPDP Act 2023; survey responses aggregated/anonymized before influencing public-facing recommendations |
| **Reliability** | Core gap-analysis and plan-generation services must degrade gracefully (fall back to last-known-good scores) if a live data connector is temporarily unavailable |
| **Auditability** | Every published district training plan retains a version history and the underlying evidence snapshot used to generate it, for scheme evaluation and accountability |

---

## 8. Proposed System Architecture

```
┌──────────────────────────────┐   ┌──────────────────────────────┐
│  Web Portal (Admin/SSC/Employer)│   │  Candidate-facing Web/Mobile   │
│  React / Next.js                │   │  (Phase 2)                     │
└───────────────┬──────────────────┘   └───────────────┬────────────────┘
                │                                       │
┌───────────────▼───────────────────────────────────────▼───────────────┐
│                         API Gateway (Node.js / FastAPI)                  │
│              AuthN/AuthZ (RBAC: admin/employer/SSC/candidate)            │
└───────┬───────────────┬────────────────┬────────────────┬───────────────┘
        │               │                │                │
┌───────▼──────┐ ┌──────▼────────┐ ┌─────▼───────────┐ ┌──▼─────────────┐
│ Ingestion      │ │ Skill Taxonomy │ │ Skill-Gap Engine │ │ Curriculum      │
│ Service        │ │ & Normalization│ │ (demand-supply   │ │ Alignment Engine│
│ - Job posting  │ │ Service        │ │  scoring, weighted│ │ - Course-skill  │
│   connectors   │ │ - NSQF/NCO map │ │  signal blend)    │ │   mapping        │
│ - Survey engine│ │ - Emerging-skill│ │ - Explainability │ │ - Obsolete/over- │
│ - Consultation │ │   vocabulary   │ │   layer           │ │   supply flags   │
│   intake forms │ │   extension    │ │                   │ │ - New-course gap │
│ - Placement    │ │                │ │                   │ │   detection       │
│   outcome intake│ │                │ │                   │ │                   │
└───────┬────────┘ └──────┬─────────┘ └─────┬─────────────┘ └──┬────────────────┘
        │                 │                  │                  │
┌───────▼─────────────────▼──────────────────▼──────────────────▼──────────────┐
│                        Core Application Services                                │
│  District Plan Generator · Employer Validation Service · Reporting/Export       │
│  Service · Notification Service · Data-Source Adapter Layer (NCS/e-Shram/EPFO)  │
└───────────────┬─────────────────────────────────────┬───────────────────────────┘
                │                                     │
        ┌───────▼────────┐                   ┌────────▼────────┐
        │  PostgreSQL      │                   │  Redis (cache,   │
        │  (primary DB)    │                   │  session, queue) │
        └───────┬──────────┘                  └──────────────────┘
                │
        ┌───────▼──────────┐
        │ Data warehouse /   │  (for historical trend analysis,
        │ analytical store   │   time-series demand/supply data)
        └────────────────────┘
```

### 8.1 Hackathon-feasible tech stack

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | React / Next.js | Consistent with the project's established frontend choice; fast dashboard/reporting UI build |
| Backend API | Node.js or FastAPI | Matches the project's prior stack decisions; FastAPI preferred if the skill-gap/NLP scoring layer is Python-native |
| Database | PostgreSQL + Redis | Relational integrity for taxonomy/course/signal data; Redis for caching and async job queues (signal ingestion is inherently batch/async) |
| Skill taxonomy normalization | NLP-based entity extraction/classification mapping free-text job postings and survey responses to a controlled skill vocabulary, seeded from NSQF qualification packs and extended for emerging skills | Reuses text-classification approach consistent with prior PRDs' NLP components; keeps taxonomy machine-readable and auditable |
| Skill-gap / matching scoring | Weighted skill-vector cosine similarity between demand-side and supply-side skill profiles, plus a rules-based confidence-weighting layer per data source | Directly reuses the matching approach already locked in for the project's academia-industry portal, applied here to role↔course matching instead of student↔internship matching |
| Explainability layer | Feature-attribution surfaced alongside every score (which signals, what weight) rather than a single opaque number | Consistent with the project's "interpretability over opacity" design principle |
| Data-source adapters | Adapter pattern per external source (job portals, National Career Service, e-Shram, EPFO, sector skill council submissions) | Keeps core engine decoupled from any single government API's availability/format, mirroring the marketplace-adapter pattern used elsewhere in this project |
| Reporting/export | Server-side PDF/CSV generation for district training plans | Needed for offline scheme review and non-technical stakeholders |

---

## 9. Simplified Data Model (ER Overview)

**Training Provider** (provider_id, name, type[govt/private], district_id, accreditation_body, active_courses)

**Course** (course_id, provider_id, title, nsqf_level, sector, skill_coverage_profile[vector], enrollment_count, status[active/flagged_obsolete/flagged_oversupplied])

**Skill** (skill_id, name, sector, taxonomy_source[NSQF/NCO/emerging], parent_skill_id)

**Job Posting Signal** (signal_id, source, role_title, required_skills[skill_id list], district_id, proficiency_level, posted_date, ingestion_confidence)

**Employer Survey Response** (response_id, employer_id, sector, district_id, hiring_difficulty_rating, emerging_skill_notes, satisfaction_with_recent_hires, submitted_at)

**Placement Outcome** (outcome_id, course_id, cohort_id, trained_count, placed_count, avg_salary_band, placement_date)

**Employer** (employer_id, org_name, sector, district_id, verified_status)

**District Training Plan** (plan_id, district_id, period, priority_roles[list], recommended_course_actions[list], evidence_snapshot_ref, version, published_at)

**Skill-Gap Score** (score_id, role_or_skill_id, district_id, demand_score, supply_score, gap_score, contributing_signals[list], computed_at)

---

## 10. Methodology Detail: How Demand Becomes a Curriculum Decision

### 10.1 Signal normalization
1. Raw signals (job postings, survey text, consultation notes, placement records) arrive via the ingestion layer
2. NLP extraction maps free-text skill mentions to the controlled skill taxonomy (NSQF/NCO-aligned where possible, with a governed process to add emerging-skill terms — e.g., "EV battery diagnostics," "generative AI prompt operations" — that don't yet have formal codes)
3. Each normalized signal is tagged with source type, confidence weight, district, and timestamp

### 10.2 Demand–supply scoring
1. Demand score per role/skill/district/proficiency = weighted blend of job-posting frequency, employer survey ratings, consultation input, and sector growth trend
2. Supply score = current enrollment/output volume of courses whose skill-coverage profile matches that skill
3. Gap score = demand − supply, normalized for comparability across sectors and districts
4. **Explainability requirement:** the UI always shows the top 3–5 contributing signals behind any score, in plain language, not just a number

### 10.3 Course flagging and recommendation
- **Obsolete flag:** sustained low/declining demand score + declining placement outcomes over a defined window (e.g., 2+ consecutive reporting periods)
- **Oversupplied flag:** enrollment/output significantly exceeds regional demand for the mapped skills
- **New-course gap:** a skill cluster shows high, sustained demand with no course whose skill-coverage profile covers it
- **Curriculum-update recommendation:** an existing course's skill-coverage profile is a partial match to a high-demand skill cluster — recommend specific module additions rather than a full new course

### 10.4 Employer validation loop
- Proposed changes route to relevant sector employers for endorse/comment/dispute before being finalized into a published district plan
- Employer endorsement strength adjusts confidence weighting for future scoring in that sector/region, creating a genuine feedback loop rather than a one-way AI output

---

## 11. Key UX Flows by Persona

### 11.1 Training Provider Administrator: "Plan next quarter's courses"
1. Open district dashboard → see ranked skill gaps for their sector/region
2. Review flagged courses (obsolete/oversupplied) with evidence panel
3. Review recommended new/updated courses with required skill modules
4. Export district training plan (PDF) for internal approval / scheme submission

### 11.2 Employer: "Validate proposed curriculum change"
1. Receive notification: "3 curriculum changes proposed for your sector in [district]"
2. Review each proposed change with supporting evidence (job posting volume, survey signals)
3. Endorse / comment / dispute → submit
4. See aggregate sector dashboard reflecting how peer employers responded

### 11.3 Candidate (Phase 2): "Choose a course with confidence"
1. Select district + interest area
2. See ranked courses with live demand score, indicative placement rate, and pay-band progression
3. Tap through to provider enrollment info

### 11.4 SSC / Scheme Administrator: "Review and publish district plan"
1. View auto-generated district training plan with full evidence snapshot
2. Adjust priorities if needed (manual override with rationale logged)
3. Publish → plan becomes visible to training providers in that district; version history retained

---

## 12. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Sparse or low-quality job-posting data for informal/rural sectors | Blend multiple signal types (survey + consultation + sector reports), weight informal-sector signals appropriately rather than relying on job-board data alone |
| Employers unwilling to participate in surveys/validation | Keep survey burden low (short, quarterly, mobile-friendly); show employers direct value (candidate quality visibility) to drive participation |
| Skill taxonomy drift / emerging skills not yet formally coded | Governed process for taxonomy extension (SSC-reviewed) so emerging-skill terms can be added without waiting for formal NSQF/NCO updates |
| Training providers distrust automated obsolescence flags (fear of funding/enrollment loss) | Always show full evidence behind every flag; frame as a recommendation for SSC/administrator review, not an automatic decision |
| Data fragmentation across government systems (NCS, e-Shram, EPFO, state skill missions) | Adapter-pattern integration layer so each source can be connected incrementally; platform delivers value even before all integrations are live |
| Overfitting recommendations to short-term demand spikes | Require sustained-signal windows (multi-period trends) before triggering obsolescence/new-course flags, not single-period spikes |
| Privacy concerns around employer hiring data and candidate outcomes | DPDP Act–compliant handling; aggregate/anonymize survey and placement data before it influences public-facing dashboards |

---

## 13. Post-Hackathon Roadmap

- **Phase 2 (0–6 months):** Placement-outcome feedback loop live, candidate-facing career pathway explorer, employer validation workflow fully live (beyond demo stub), pilot integration with one real job-posting data source and one state's training-provider network
- **Phase 3 (6–12 months):** Trainer capability/certification gap tracker, equipment/infrastructure gap planner, integration with National Career Service / e-Shram / EPFO signals for richer, more authoritative demand data
- **Phase 4 (12+ months):** Predictive 12–24 month demand forecasting, generative curriculum-module drafting (SSC-reviewed before publishing), cross-state benchmarking and best-practice course transplantation, national rollout across all NSQF-aligned sectors

---

## 14. Alignment to Impact Goals

| Impact Goal | How Setu-Kaushal delivers it |
|---|---|
| Stronger placement rates | Courses are continuously realigned to actual, evidenced demand rather than static historical categories |
| Reduced mismatch | Skill-gap engine directly measures demand × supply at role/skill/district/proficiency granularity |
| Improved employer satisfaction | Direct employer validation loop gives industry a real voice in curriculum decisions, not just a survey that disappears into a report |
| Timely course revision | Rolling signal ingestion + explainable flags replace multi-year manual review cycles |
| Better equipment/trainer planning | District training plans surface capacity needs alongside curriculum recommendations |
| Clearer career pathways | Candidate-facing pathway explorer (Phase 2) turns the same demand data into individual-level guidance |

---

*This PRD is scoped for SIH 2026 hackathon submission, following the same structure, P0–P3 prioritization, and interpretability-first design principle used for the project's other submissions (Kalā Setu, Academia-Industry Collaboration Portal). A companion one-page executive summary and pitch deck can be produced for the portal's submission format on request.*
