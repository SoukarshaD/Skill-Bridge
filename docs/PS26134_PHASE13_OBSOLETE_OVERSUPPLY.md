# Phase 13 — Obsolete & Oversupply Intelligence

## Objective
Build an explainable intelligence layer identifying training programs that may require curriculum review due to oversupply or obsolescence (weak demand and poor alignment).

## Data Sources
- **Demand Signals**: Processed market data dynamically weighted by recency.
- **Training Supply**: Published training programs mapped against the canonical skill taxonomy.

## Oversupply Methodology
Identifies when training coverage significantly exceeds observed platform demand.
- Calculates an aggregate `supplyScore` and `demandScore` per program (or per skill).
- If the Supply/Demand ratio reaches or exceeds 3.0 (and minimum supply thresholds are met), the entity is flagged as `POTENTIAL_OVERSUPPLY`.

## Potential Obsolescence Methodology
Identifies programs that are misaligned with the current market reality.
Requires multiple corroborating signals to trigger:
1. Very weak alignment (< 30%) with the broader demand universe.
2. Low aggregate demand for the program's specific targeted skills (< 3.0 demand score).
3. A confirmed `DECLINING` historical trend.

## Demand Trend Methodology
Compares recent signal activity (0–90 days) against historical signal activity (91–180 days).
- **Declining**: Recent demand is less than 50% of historical demand.
- **Increasing**: Recent demand is greater than 150% of historical demand.
- **Stable**: Demand volume is relatively proportionate between periods.

## Historical Evidence Requirements
If there are fewer than 3.0 combined confidence-weighted signals in a skill's recent or historical profile, the system refuses to guess the trend. It outputs `INSUFFICIENT_DATA`.

## Outcome Evidence
Currently unused. Application/internship outcome data was deemed insufficiently normalized to be a primary signal for course obsolescence in this phase.

## Flag Types
- `POTENTIAL_OVERSUPPLY`: Market saturation warning.
- `POTENTIAL_OBSOLESCENCE`: Severe misalignment + declining demand warning.
- `CURRICULUM_REVIEW`: Misalignment + low demand, but lacking enough historical data to confirm a declining trend.
- `INSUFFICIENT_DATA`: Not enough data to assess.
- `BALANCED`: Healthy alignment.

## Severity
- **HIGH**: Supply ratios > 5x, or Obsolescence with confirmed declining trends.
- **MEDIUM**: Standard oversupply (3x ratio), or Curriculum Review without a definitive trend.

## Confidence
Derived from the total volume of signals. A high supply/demand ratio might be tagged `LOW` confidence if it is only based on 1 program and 0 jobs. Strong thresholds (10+ jobs, 5+ programs) elevate confidence to `HIGH`.

## Explainability
Every API response returns a robust evidence object detailing the ratio, trend, and precise thresholds evaluated, alongside human-readable explanations.

## API
- `GET /api/lmi/oversupply`: Raw skill-level oversupply metrics.
- `GET /api/lmi/review-flags`: Bulk program view identifying programs with active warnings.
- `GET /api/lmi/programs/:programId/review-flags`: Detailed explainability for a specific program.

## Frontend
- Added a new Dashboard at `/admin/lmi/review-flags` surfacing critical programs.
- Added a "Curriculum Review Signals" widget directly on the Academician course detail page (`/academician/programs/[id]`).

## Security
Endpoints are strictly protected by `ADMIN` and `INDUSTRY` roles. The detail endpoint is additionally opened to `ACADEMICIAN` users so they can natively view their own course warnings.

## Testing
Comprehensive integration tests in `backend/src/__tests__/lmi-review.test.ts`. Validates logic for oversupply ratios, obsolescence thresholds, and insufficient data handling.

## Validation
- `npm run test:backend` passing (with known, unrelated pre-existing career-guidance mock timeout).
- Frontend builds cleanly.
- `npx prisma validate` passing.

## Limitations
- These are platform-derived review signals, not definitive determinations that a course is obsolete.
- Insufficient historical evidence results in `INSUFFICIENT_DATA` rather than an inferred trend.
- The platform MUST NOT automatically modify, delete, or archive programs based on these flags. Administrator review is strictly required.
