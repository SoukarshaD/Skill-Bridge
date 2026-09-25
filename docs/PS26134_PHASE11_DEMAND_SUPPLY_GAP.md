# Phase 11 — Demand vs Training Supply

## Objective
Build the first Labour-Market Intelligence layer by comparing Industry Skill Demand against Training Supply to produce an explainable Skill Gap for skills tracked in the platform.

## Demand Methodology
- The MVP methodology focuses on **Demand Signals** marked as `PROCESSED`.
- The score is derived by taking the sum of the `confidence` of each normalized `DemandSignalSkill` attached to a canonical `SkillTaxonomy` record.
- **Recency weight**: Signals collected within the last 90 days receive a `1.0` multiplier. Signals older than 90 days receive a `0.5` multiplier to slowly decay older demand.
- Note: This relies entirely on platform-ingested signals and is not a forecast of overall market size.

## Supply Methodology
- Training supply is represented by the active (e.g., `PUBLISHED`) training programs and learning resources that map to canonical skills.
- The MVP scores supply by attributing `1.0` points for every active `Program` teaching the skill and `0.5` points for every `LearningResource` (as resources are typically smaller in scope than structured programs).
- Future phases may integrate student capacity and enrollment numbers to better model the volumetric output of the supply.

## Gap Formula
- `gapScore = demandScore - supplyScore`
- Values are rounded to 1 decimal place for readability.

## Gap Classification
The gap score translates into the following broad indicators:
- **HIGH GAP**: `gapScore >= 10`
- **MODERATE GAP**: `gapScore >= 5`
- **BALANCED**: `gapScore > -5 and gapScore < 5`
- **HIGH SUPPLY**: `gapScore <= -5`

## Confidence
The confidence indicator measures the density of the underlying data for a given skill gap calculation:
- **HIGH**: >= 10 observed demand signals.
- **MEDIUM**: 3 to 9 observed demand signals.
- **LOW**: < 3 observed demand signals.

*A result might show a HIGH GAP but with LOW CONFIDENCE, clearly signaling that while demand outweighs supply in the database, the sample size is too small to make policy decisions.*

## Role Filtering
- Filtering by `roleId` is supported. When applied, only demand signals specifically targeted at that role are included in the demand score calculation. Supply is left untouched since training programs develop foundational skills that apply across roles.

## Location Filtering
- Filtering by `location` acts as a substring/case-insensitive match against `DemandSignal.normalizedLocation`.
- On the supply side, the system counts programs that either contain the location string in `Program.location` OR are delivered in an `ONLINE` mode (which are treated as globally available).

## Explainability
The intelligence API returns full transparency metrics on how a gap was derived:
- `demandScore` and `demandSignalCount`
- `supplyScore` and `supplyProgramCount`
- `methodology`: A string payload clarifying the math used in the calculation.
This ensures administrators are not trusting a "black box" number.

## API
- **Endpoint**: `GET /api/lmi/skill-gaps`
- **Query Params**: `location`, `roleId`, `skillId`, `gapClassification`
- **Auth**: Protected (Requires `ADMIN` or `INDUSTRY` role)

## Frontend
- Added a dedicated view at `/admin/lmi/skill-gaps`.
- Presents the top 10 gaps in a `Recharts` comparative BarChart.
- Renders the full dataset in a data table with color-coded classification badges, confidence badges, and an explainability tooltip (`shadcn/ui`).
- Includes dynamic filtering controls for `location` and `gapClassification`.

## Demo Data
- Created a standalone seeder `add-demo-lmi.ts` to populate realistic synthetic data for React (High Gap), Project Management (High Supply), and Data Analysis (Balanced).
- The frontend clearly denotes the UI as platform-derived intelligence.

## Testing & Validation
- Added `backend/src/__tests__/lmi-intelligence.test.ts`.
- Tests cover demand aggregation, training supply aggregation, location filtering, and gap classification thresholds.
- Backend compilation and testing passed successfully.

## Known Limitations
- **Platform-derived intelligence**: The figures represent the exact data ingested into the system, not official market statistics.
- External live ingestion from actual job boards is not yet implemented.
- Volumetric enrollment (actual number of students being trained) is not yet factored into the supply equation.
- Demand Forecasting (predicting future trends) is not implemented.
- Program/Course alignment suggestions (what to build next) are not implemented.

## Confirmation
**Phase 12 (Course/Program Alignment) was NOT started.** The execution cleanly stops at the read-only gap reporting layer.
