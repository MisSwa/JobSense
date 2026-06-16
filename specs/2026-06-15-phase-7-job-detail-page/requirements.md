# Phase 7 — Job Detail Page: Requirements

**Phase:** 7
**Date:** 2026-06-15
**Branch:** `phase-7-job-detail-page`
**Depends on:** Phase 5 (jobs table, POST /api/jobs), Phase 6 (job list, job cards)

---

## Scope

Add `GET /api/jobs/{id}` returning a single job. Add a `/jobs/:id` route with a two-column detail page. Job cards in the list become clickable links. Non-existent IDs return 404 from the backend and a "Job not found" message on the frontend.

---

## Backend Deliverables

### Endpoint: `GET /api/jobs/{id}`
- Returns `200 JobOut` for a valid job ID
- Returns `404` with `{ "detail": "Job not found." }` if the ID does not exist

---

## Frontend Deliverables

### Route
- New route `/jobs/:id` in `App.jsx`
- New page component `frontend/src/pages/JobDetail.jsx`

### JobDetail page — two-column layout

**Left column (primary info):**
- Title (large heading)
- Status badge (same colors as list)
- Labeled field rows: Company, Location, Employment type, Vendor, Client, Salary range, Source URL (as a link if set)
- Fit score placeholder: `—` with label "Fit score" (Phase 12 will populate)
- Conflict indicator placeholder: gray dot with label "Conflict" (Phase 13 will populate)

**Right column (secondary info):**
- Tech stack: list of pills, or "—" if empty
- Recruiter info: name, email, phone from `recruiter_info` dict, or "—" if not set
- Job description: scrollable `<pre>` block if `raw_text` is set, or "—"

**Header:**
- "← Back to Jobs" link navigating to `/jobs`
- Created date (formatted as e.g. "Jun 15, 2026")

**Not-found state:**
- If `GET /api/jobs/{id}` returns 404: show "Job not found." with a "← Back to Jobs" link

### Job list cards (Phase 6) — make clickable
- Wrap `JobCard` content in a `<Link to={/jobs/${job.id}}>` (react-router-dom)

### Hook: `frontend/src/hooks/useJobDetail.js`
- Fetches `GET /api/jobs/{id}` on mount
- Returns `{ job, loading, notFound }`

---

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| Layout | Two-column | Better use of horizontal space; detail pages are data-heavy |
| Navigation | Card click → /jobs/:id | Natural UX; back button returns to filtered list |
| 404 | "Job not found" message | No redirect; user sees what happened |
| Fit score / conflict | Placeholders | Real values come in Phase 12 / 13; structure is in place |

---

## Out of Scope
- Status update (Phase 8)
- Delete (Phase 9)
- Agent decisions panel (Phase 11)
