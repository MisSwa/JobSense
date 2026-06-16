# Phase 8 — Job Status Update: Requirements

**Phase:** 8
**Date:** 2026-06-15
**Branch:** `phase-8-job-status-update`
**Depends on:** Phase 7 (job detail page, GET /api/jobs/{id})

---

## Scope

Add `PUT /api/jobs/{id}/status`. The job detail page header replaces the static status badge with an inline dropdown that saves on change and shows a brief "Saved" flash.

---

## Backend Deliverables

### Endpoint: `PUT /api/jobs/{id}/status`

Request body:
```json
{ "status": "applied" }
```

- Accepts any valid `JobStatus` value; no transition restrictions
- Returns `200 JobOut` with the updated job
- Returns `404` if the job does not exist
- Returns `422` for invalid status values (Pydantic validation)

Schema: `JobStatusUpdate` in `app/schemas/job.py`
```python
class JobStatusUpdate(BaseModel):
    status: JobStatus
```

---

## Frontend Deliverables

### JobDetail page header — replace static badge with status dropdown

The title + status area in the header becomes:
- Title (unchanged)
- `<select>` dropdown containing all 7 status values, pre-selected to the job's current status
- Changing the selection immediately calls `PUT /api/jobs/{id}/status`
- While the request is in flight: dropdown disabled
- On success: brief "Saved" flash (green text, 2 seconds) appears next to the dropdown; the job's status in state is updated
- On error: inline error message next to the dropdown

The static status badge in the header is removed (the dropdown replaces it entirely).

### Hook addition: `useJobDetail.js`

Add `updateStatus(status)` function:
- Calls `PUT /api/jobs/{id}/status`
- On success, updates `job` in local state
- Returns `{ updating, updateError }`

---

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| Save trigger | On change (no Save button) | Fewer clicks; status is a single-field update |
| Transition restrictions | None | Manual corrections are common; reopening rejected jobs is valid |
| Placement | Header dropdown | Status is primary metadata; belongs at the top |
| Optimistic update | No — wait for server | Avoids stale state if the request fails |

---

## Out of Scope
- Delete (Phase 9)
- Active/archive tab separation (Phase 9A)
- Conflict/fit score display (Phase 12/13)
