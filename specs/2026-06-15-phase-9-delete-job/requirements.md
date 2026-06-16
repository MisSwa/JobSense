# Phase 9 — Delete Job: Requirements

**Phase:** 9
**Date:** 2026-06-15
**Branch:** `phase-9-delete-job`
**Depends on:** Phase 7 (GET /api/jobs/{id}), Phase 8 (job detail page exists)

---

## Scope

Add `DELETE /api/jobs/{id}`. On the job detail page, a two-step inline delete button (Delete → Confirm + Cancel) calls the endpoint and redirects to `/jobs` on success.

---

## Backend Deliverables

### Endpoint: `DELETE /api/jobs/{id}`

- Returns `204 No Content` on success
- Returns `404` if the job does not exist
- No request body

The existing FK constraints handle related records automatically:
- `applications`, `interviews`, `feedback` → `ON DELETE CASCADE` — rows are hard-deleted along with the job
- `agent_logs`, `suggestions` → `ON DELETE SET NULL` — rows survive with `job_id = null`

No Alembic migration is required (FK constraints already in place from earlier phases).

---

## Frontend Deliverables

### `useJobDetail.js` — add `deleteJob()`

- Calls `DELETE /api/jobs/{id}`
- Returns `{ deleting, deleteError }`
- On success: caller navigates to `/jobs`

### `JobDetail.jsx` — inline two-step delete

Add a delete control in the job detail header (or footer of the detail section), separate from the status dropdown:

**State: default**
```
[ Delete job ]
```

**State: confirming** (after first click)
```
[ Confirm delete? ]  [ Cancel ]
```

Behavior:
- First click on "Delete job": switch to confirming state
- "Confirm delete?": calls `deleteJob()`; button disabled while `deleting` is true
- "Cancel": resets to default state
- On success: `navigate("/jobs")`
- On error: inline error message below the buttons; reset to default state

Button styles follow Tailwind-only constraint:
- "Delete job" / "Confirm delete?": `text-red-600 border border-red-300 hover:bg-red-50`
- "Cancel": `text-gray-500 border border-gray-300 hover:bg-gray-50`

---

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| Response code | 204 No Content | Standard for DELETE; nothing to return |
| Confirmation UX | Inline two-step (no modal) | Tailwind-only constraint; no modal component exists |
| Save trigger | Confirm click only | Two-step prevents accidental deletion |
| Related records | DB cascades (SET NULL / CASCADE) | FKs already configured; no extra app logic needed |
| Post-delete redirect | `/jobs` list | Job no longer exists; detail page would 404 |

---

## Out of Scope

- Soft delete / undo (Phase 9 is hard delete only)
- Active/archive tab separation (Phase 9A)
- Bulk delete
