# Phase 9: LMI Data Design

## Objective
Establish the foundational data structure for the Labour Market Intelligence (LMI) module without implementing real-time ingestion, NLP extraction, or predictive algorithms. This foundation must support manual/synthetic data entry with clear provenance.

## Principles
1. **Reuse**: Leverage existing models (`SkillTaxonomy`, `CareerRole`, `Organization`) rather than duplicating them.
2. **Provenance**: Every demand signal must trace back to a source type and date.
3. **Traceability**: Clearly distinguish between RAW textual signals and STRUCTURED/NORMALIZED canonical skills.

## Proposed Data Models

### 1. `DemandSignal` (New Model)
Represents a discrete unit of observed labour market demand (e.g., a job posting, an employer consultation).

**Fields:**
- `id`: String (cuid, primary key)
- `sourceType`: Enum `DemandSourceType` (e.g., `JOB_POSTING`, `EMPLOYER_SURVEY`, `INDUSTRY_CONSULTATION`, `MANUAL_ENTRY`)
- `sourceReference`: String? (URL, report ID, or manual note)
- `title`: String (Raw job title or need description)
- `roleId`: String? (Foreign key to existing `CareerRole` if matched)
- `organizationId`: String? (Foreign key to existing `Organization` if known)
- `location`: String? (Raw location string - e.g., "Mumbai", "Remote". No complex GIS needed yet)
- `description`: String? (Raw description text)
- `observedAt`: DateTime (When the demand was active/posted)
- `collectedAt`: DateTime (When it was recorded in the system, defaults to now)
- `confidence`: Float (0.0 to 1.0, representing certainty of extraction)
- `status`: Enum `DemandSignalStatus` (e.g., `RAW`, `PROCESSED`, `ARCHIVED`)
- `isSynthetic`: Boolean (Default false, used to clearly mark demo data)
- `createdAt` / `updatedAt`: Standard timestamps

**Relations:**
- `role`: Relation to `CareerRole`
- `organization`: Relation to `Organization`
- `skills`: Relation to `DemandSignalSkill`

### 2. `DemandSignalSkill` (New Model)
Represents a specific skill requested within a demand signal.

**Fields:**
- `id`: String (cuid, primary key)
- `demandSignalId`: String (Foreign key to `DemandSignal`)
- `skillId`: String (Foreign key to existing `SkillTaxonomy`)
- `requiredProficiency`: Int? (1-5 scale if specified in source)
- `isMandatory`: Boolean (Default true)
- `evidence`: String? (Snippet from the raw description that justified this skill extraction)

**Relations:**
- `demandSignal`: Relation to `DemandSignal`
- `skill`: Relation to `SkillTaxonomy`

## Reused Models
- **`SkillTaxonomy`**: The canonical vocabulary. All LMI skills MUST map to this.
- **`CareerRole`**: Canonical roles. A `DemandSignal` can optionally map to a `CareerRole` to track demand for specific pathways.
- **`Organization`**: Reused for tracking which employer needs the skills (if known).

## Conclusion
This design avoids duplicating the skill taxonomy, provides a flexible bucket for capturing raw demand (`DemandSignal`), and structures the connection between raw demand and canonical skills (`DemandSignalSkill`). It fully satisfies the phase 9 provenance requirements.
