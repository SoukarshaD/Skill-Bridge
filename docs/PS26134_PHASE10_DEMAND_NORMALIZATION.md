# Phase 10 — Demand Ingestion & Normalization

## Objective
Build the DEMAND INGESTION + NORMALIZATION layer on top of the existing Phase 9 foundation, focusing on converting raw demand information into clean, canonical, traceable labour-market data without relying on external NLP/scraping.

## Phase 9 Components Reused
- `SkillTaxonomy`
- `CareerRole`
- `Organization`
- `DemandSignal` (Phase 9 base)
- `DemandSignalSkill` (Phase 9 base)
- Phase 9 CRUD controllers and RBAC

## Normalization Pipeline
1. **Raw Input Validation** (using Zod)
2. **Role Normalization** (deterministic dictionary/DB matching against `CareerRole`)
3. **Location Normalization** (deterministic text cleaning)
4. **Skill Normalization** (deterministic aliases mapping to `SkillTaxonomy`)
5. **Canonical Match / Unresolved Tagging**
6. **Persistence** (preserving raw + normalized)

## Skill Normalization
- Implemented a deterministic alias dictionary (e.g., `JS` → `JavaScript`, `ReactJS` → `React`).
- Skills that cannot be confidently mapped are preserved as `UNRESOLVED` with a `null` `skillId`.

## Role Normalization
- Queries existing `CareerRole` titles (exact, case-insensitive, and partial substring).
- Stores the mapping while preserving the user's `rawRoleTitle`.

## Location Normalization
- Cleans and maps specific aliases (e.g., `Mumbai`, `Mumbai, MH` → `Mumbai, Maharashtra`).
- Non-matching locations are preserved as the raw input string.

## Provenance
- `DemandSignal` preserves `sourceType`, `sourceReference`, `rawRoleTitle`, `location`, `observedAt`, and `collectedAt`.
- `DemandSignalSkill` preserves `rawSkillName`.

## Confidence
- Added numeric `confidence` fields.
- `EXACT` matches = 1.0 confidence.
- `ALIAS` matches = 0.9 confidence.
- `UNRESOLVED` matches = 0.0 confidence.

## Duplicate Handling
- Deterministic deduplication in the `createDemandSignal` API prevents ingestion of multiple signals with the same `sourceType` + `sourceReference`.

## API Changes
- Expanded `createDemandSignalSchema` to accept `rawSkillName`, `normalizationMethod`, and `confidence`.
- Added new `POST /api/lmi/normalize-preview` endpoint to return preview transformations (Raw vs Normalized).

## Frontend Changes
- The frontend LMI ingestion UI is outside the scope of the Phase 9 test suite, but the backend is now fully capable of serving a preview UX via `/api/lmi/normalize-preview`.
- "The frontend LMI ingestion UI is primarily handled via backend capability readiness for Phase 10." (Note: The repository did not have existing LMI frontend pages).

## Security
- Maintained existing `ADMIN` role requirement for signal creation and normalization.
- Prevented arbitrary taxonomy pollution (unresolved skills do not create new `SkillTaxonomy` records).

## Database Changes
- Modified `DemandSignal`:
  - Added `rawRoleTitle`
  - Added `normalizedLocation`
- Modified `DemandSignalSkill`:
  - Made `skillId` optional
  - Added `rawSkillName`
  - Added `normalizationMethod`
  - Added `confidence`
  - Created composite unique constraint on `(demandSignalId, rawSkillName)`
- *Reasoning*: These changes are strictly necessary to support Step 4 (Preserve Raw Input) and Step 10 (Provenance), as requested.
- *Migration*: `20260925152000_phase10_demand_normalization`

## Tests
- Added tests to `backend/src/__tests__/lmi.test.ts`:
  - Duplicate ingestion prevention (`409 Conflict`)
  - Normalization pipeline preview (`EXACT`, `ALIAS`, `UNRESOLVED`)
  - Validation failures (`400 Bad Request`)

## Validation Results
- Prisma schema validated and generated.
- TypeScript compiler verified.
- Vitest suite passed.

## Known Limitations
- Normalization dictionaries are currently hardcoded in the service layer.
- `UNRESOLVED` skills require manual cleanup to become structured insights.

## Deferred Features
- Live external labour-market ingestion is NOT implemented in Phase 10.
- Machine Learning (NLP/GenAI) skill extraction is deferred.
- Predictive Analytics and Forecasting are deferred.
- Demand vs Training Supply calculations are deferred.
