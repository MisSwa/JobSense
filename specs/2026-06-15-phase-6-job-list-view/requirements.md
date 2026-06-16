# Phase 6 — Job List View: Requirements

**Phase:** 6
**Date:** 2026-06-15
**Branch:** `phase-6-job-list-view`
**Depends on:** Phase 5 (jobs table, POST /api/jobs)

---

## Scope

Add `GET /api/jobs` with optional filter query params. The Jobs page replaces the empty state with a filterable list of job cards. The "Add Job" button and modal from Phase 5 remain intact.

---

## Backend Deliverables

### Endpoint: `GET /api/jobs`

Query params (all optional):
- `status` — filter by `JobStatus` enum value
- `employment_type` — filter by `EmploymentType` enum value
- `conflict_level` — filter by `ConflictLevel` enum value

Behaviour:
- Returns all matching jobs ordered by `created_at DESC`
- No filters applied → returns all jobs
- Response: `200` with `list[JobOut]`

---

## Frontend Deliverables

### Jobs page — updated `frontend/src/pages/Jobs.jsx`

**Filter bar** (above the job list):
- Three dropdowns: Status, Employment Type, Conflict Level
- Each defaults to empty (show all)
- Selecting a value re-fetches from `GET /api/jobs` with the filter param

**Job cards** (one per job, newest first):
- Title (bold)
- Company · Location (secondary text, separated by ·)
- Employment type badge (pill)
- Status badge (colored pill): `discovered` → gray, `applied` → blue, `screening` → yellow, `interview` → purple, `offer` → green, `rejected` → red, `withdrawn` → gray
- Fit score: shows `— ` placeholder until Phase 12

**Empty state:**
- When no jobs: "No jobs yet. Click 'Add Job' to get started."
- When filters active but no matches: "No jobs match the current filters."

**Hook:** `useJobs.js` extended with `fetchJobs({ status, employment_type, conflict_level })` that fetches on mount and whenever filters change.

---

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| Sorting | `created_at DESC` | Most recently added job always at top |
| Pagination | None | Personal tool; flat list is sufficient |
| Filter UX | Three independent dropdowns | Simple, no tab state to manage |
| Fit score | Placeholder `—` | Real scores come in Phase 12; cards are ready |
| Cards link to detail | No link yet | Phase 7 adds the detail page |

---

## Out of Scope
- Job detail page (Phase 7)
- Status update from list (Phase 8)
- Delete (Phase 9)
- Active/archive tabs (Phase 9A)
