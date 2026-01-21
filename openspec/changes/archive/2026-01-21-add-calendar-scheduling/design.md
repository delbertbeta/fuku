## Context

The change introduces a new calendar view that links existing outfits to dates. It requires data modeling for date-outfit associations, API operations for CRUD, and UI navigation updates to expose the new tab.

## Goals / Non-Goals

- Goals: Month-view calendar, per-day outfit association management, fixed timezone date boundaries.
- Non-Goals: Creating outfits inside the calendar, advanced scheduling (time of day), recurring outfits.

## Decisions

- Decision: Store date-outfit associations in a dedicated table keyed by user_id + date + outfit_id for fast lookups.
- Decision: Use a fixed Asia/Shanghai timezone for date boundaries regardless of client locale.
- Alternatives considered: Reusing outfits table with date fields (rejected to avoid polluting outfit model with schedule data).

## Risks / Trade-offs

- Fixed timezone could surprise users in other locales; mitigated by explicit spec and UI hints.
- Month-view performance needs efficient indexing; add indexes on user_id and date.

## Migration Plan

- Add new table via schema initialization migration.
- Backfill not required (new feature).
- Ensure existing data untouched.

## Open Questions

- None.
