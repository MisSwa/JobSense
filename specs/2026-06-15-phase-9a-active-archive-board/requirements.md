# Phase 9A — Active/Archive Board View: Requirements

**Phase:** 9A
**Date:** 2026-06-15
**Branch:** `phase-9a-active-archive-board`
**Depends on:** Phase 8 (PUT /api/jobs/{id}/status), Phase 9 (delete working)

---

## Scope

Add a `?view=` query param to `GET /api/jobs` that segments jobs into active and archive buckets. The Jobs page gains Active/Archive tabs with count badges. Archive cards get an inline Reopen button. The status dropdown sub-filters within the current tab.

---

## Backend Deliverables

### Updated: `GET /api/jobs`

New optional query param: `view` (default: `active`)

| `view` value | Statuses returned |
|---|---|
| `active` | `discovered`, `screening`, `interview`, `offer` |
| `archive` | `applied`, `rejected`, `withdrawn` |
| _(omitted)_ | defaults to `active` |

**Compounding:** `view` and `status` are AND-ed. If both are provided, the response includes only jobs that match the view's status bucket AND the specific status value.

- `GET /api/jobs` → active jobs (default)
- `GET /api/jobs?view=archive` → archived jobs
- `GET /api/jobs?view=active&status=screening` → only screening jobs
- `GET /api/jobs?view=active&employment_type=contract` → active contract jobs

Returns `422` for unrecognised `view` values.

No schema changes. No migration required.

---

## Frontend Deliverables

### `useJobs.js`

- `fetchJobs` passes `view` param to the API (receives it via `filters.view`)
- New `fetchCounts()` — parallel fetch of `?view=active` and `?view=archive` (no sub-filters); updates `activeCount` and `archiveCount` state
- New `reopenJob(id)` — calls `PUT /api/jobs/{id}/status` with `{ status: 'discovered' }`; returns `true` on success

### `Jobs.jsx`

**Tab bar** (replaces no UI — inserted above filter bar):
- Two tabs: Active | Archive
- Each tab has a count badge from `activeCount` / `archiveCount` (unfiltered totals)
- Active tab selected by default
- Switching tabs resets the status filter to `''`

**Status filter** (retained, sub-filters within tab):
- Active tab options: Discovered, Screening, Interview, Offer
- Archive tab options: Applied, Rejected, Withdrawn

**Archive job cards** (`ArchiveJobCard` component):
- Same layout as `JobCard` but the card is a `div` (not a full `Link` wrapper)
- Inner title/details are a `Link` to the job detail page
- "Reopen" button in the top-right; calls `reopenJob`, then refreshes list + counts
- On reopen success: job disappears from archive list immediately (re-fetch)

**Empty state** is tab-aware:
- Active + no filters: "No active jobs. Click "+ Add Job" to get started."
- Archive + no filters: "No archived jobs."
- Either tab + filters active: "No jobs match the current filters."

---

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| `view` default | `active` | Active pipeline is the primary view; archive is secondary |
| `view` + `status` | AND (compound) | Allows sub-filtering within a view (e.g. only Screening in Active) |
| Count badge source | Unfiltered view totals (`fetchCounts`) | Badge should reflect total pipeline size, not the current sub-filter |
| Reopen target status | `discovered` | Brings the job back into the active funnel at the earliest stage |
| Status dropdown options | Filtered to current tab | Prevents users from choosing archive statuses while on Active tab |

---

## Out of Scope

- Deduplication engine (Phase 9B)
- Kanban board (Phase 30)
- Bulk archive / bulk reopen
