# Phase 14 — District Training Plans

## 1. Objective
Build an intelligence and planning layer that helps administrators identify high-demand skills, training supply, skill gaps, and recommended programs at a **district** level. The system avoids automatic policy decisions and strictly uses deterministic logic based on observed platform data.

## 2. Existing Architecture Reused
- Phase 11 `LmiIntelligenceService` is reused verbatim by injecting the district name into its location filter.
- Phase 12 `LmiAlignmentService` is reused to score program alignment for recommendations.
- Phase 13 Review methodology is reused to flag oversupplied skills locally.
- Phase 10 Normalization continues to drive clean string matching for locations.

## 3. District Data Source
Districts are resolved organically from `normalizedLocation` present on processed `DemandSignal` records. 

## 4, 5, 6. Methodology (Demand, Supply, Gap)
- **Demand**: Recency-weighted sum of confidence scores on demand signals where `normalizedLocation` contains the district name.
- **Supply**: Total count of active `PUBLISHED` programs where the location contains the district name OR the mode is `ONLINE` (Global).
- **Gap**: Direct subtraction of Supply from Demand.

## 7. Priority Methodology
Priority is deterministically assigned based on the severity of the gap combined with evidence volume:
- `HIGH`: Gap is classified as `HIGH GAP` AND there are at least 5 demand signals.
- `MEDIUM`: Gap is `MODERATE GAP` with at least 3 signals, OR `HIGH GAP` with at least 2 signals.
- `LOW`: Gap is `BALANCED` or insufficient evidence exists for elevation.
- `INSUFFICIENT_DATA`: The combined volume of demand and supply signals is less than 2.

## 8. Program Recommendation Methodology
Local and online published programs are scanned for overlap against the district's Priority Skills (skills flagged as HIGH or MEDIUM). 
Recommended programs are returned alongside their Phase 12 `alignmentScore` and a clear, deterministic explanation ("Program covers X of the district's priority skills").

## 9. Phase 13 Integration
Local oversupply uses the exact same ratio check introduced in Phase 13 (`Supply / Max(Demand, 1.0) >= 3.0`), ensuring consistency.

## 10. Evidence/Confidence Handling
If the total volume of demand signals for a district is less than 3, the entire District Plan is flagged with an `INSUFFICIENT_DATA` evidence status. The UI renders a prominent warning clarifying that the metrics may be volatile or inaccurate.

## 11. API Endpoints
- `GET /api/lmi/district-plans`: Returns an array of distinctly observed districts based on valid demand signals. Protected by `ADMIN`.
- `GET /api/lmi/district-plans/:district`: Returns the fully calculated deterministic training plan for the specified district. Protected by `ADMIN`.

## 12. Frontend Routes
- `/admin/lmi/district-plans`: Dedicated admin dashboard combining the district selector, status warnings, priority metrics, oversupply reviews, and program recommendations.

## 13. Database Changes
**ZERO database changes**. The entire planning layer dynamically aggregates and formats the existing normalized data, avoiding stale snapshot tables.

## 14. Test Results
Comprehensive integration tests in `backend/src/__tests__/lmi-district-plan.test.ts`. Validates:
- RBAC authorization (rejection of non-admin).
- Distinct district discovery.
- Priority and oversupply deterministic sorting.
- Automatic application of `INSUFFICIENT_DATA`.

## 15. Demo Data
No demo data changes were required. The existing synthetic datasets natively support location variants (like "Pune, MH") that naturally map to the district logic.

## 16. Known Limitations
- District strings are derived from raw demand signals. While normalized for case/whitespace, extremely messy geographic descriptions might split into separate district representations until an advanced GIS lookup is implemented (out of scope).

## 17. Explicit Policy Statement
These indicators are calculated exclusively from platform-observed demand signals and training supply. They are NOT official government labour-market statistics. Priority is determined deterministically based on gap size and available signal volume. **No automatic policy decisions (course creation, archival, curriculum modification) are made by this system.**
