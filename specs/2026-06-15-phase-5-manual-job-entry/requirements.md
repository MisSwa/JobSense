# Phase 5 — Manual Job Entry: Requirements

**Phase:** 5
**Date:** 2026-06-15
**Branch:** `phase-5-manual-job-entry`
**Depends on:** Phase 1 (Job model, jobs table), Phase 2 (seed user)

---

## Scope

Add `POST /api/jobs` to create a job with all user-settable fields. The Jobs page gains an "Add Job" button that opens a modal form. After saving, the job is persisted and the modal closes.

---

## Backend Deliverables

### Pydantic schemas — `JobCreate` and `JobOut`

Defined in `app/schemas/job.py`.

**`JobCreate`** — request body for POST /api/jobs:

| Field | Type | Required |
|---|---|---|
| `title` | `str` | Yes |
| `company` | `str \| None` | No |
| `vendor` | `str \| None` | No |
| `client` | `str \| None` | No |
| `salary_min` | `int \| None` | No |
| `salary_max` | `int \| None` | No |
| `tech_stack` | `list[str] \| None` | No |
| `location` | `str \| None` | No |
| `employment_type` | `EmploymentType \| None` | No |
| `source_url` | `str \| None` | No |
| `recruiter_name` | `str \| None` | No |
| `recruiter_email` | `str \| None` | No |
| `recruiter_phone` | `str \| None` | No |
| `raw_text` | `str \| None` | No |

`source` is set to `"manual"` by the endpoint (not user-supplied).
`recruiter_name/email/phone` are combined into the `recruiter_info` JSONB dict on save.

**`JobOut`** — response shape:

All `JobCreate` fields plus: `id`, `status`, `fit_score`, `fit_explanation`, `conflict_level`, `conflict_reasons`, `source`, `dedup_hash`, `created_at`, `updated_at`.

### Endpoint: `POST /api/jobs`
- Accepts `JobCreate` body
- Sets `source = "manual"`, `status = "discovered"`
- Builds `recruiter_info = {"name": ..., "email": ..., "phone": ...}` (omitting None values)
- Inserts the job row and returns `201` with `JobOut`

### Router

New file: `app/routers/jobs.py`, mounted at `/api` prefix in `main.py`.

---

## Frontend Deliverables

### Jobs page — `frontend/src/pages/Jobs.jsx`

Replaces the stub. Contains:
- Page heading "Jobs"
- "Add Job" button (top right)
- `AddJobModal` component (inline, not a separate file for now)

### AddJobModal

A full-screen overlay with a scrollable form panel. Fields:

| Field | Input type | Notes |
|---|---|---|
| Title | text | Required — shows validation error if empty |
| Company | text | |
| Location | text | |
| Employment type | select | fte / contract / contract-to-hire / part-time / (blank) |
| Vendor (staffing agency) | text | |
| Client (end-client) | text | |
| Salary min | number | USD |
| Salary max | number | USD |
| Tech stack | text | Comma-separated, converted to array |
| Source URL | text | Job posting link |
| Recruiter name | text | |
| Recruiter email | text | |
| Recruiter phone | text | |
| Job description | textarea | Raw text paste |

**Behaviour:**
- "Add Job" opens the modal; clicking overlay or "Cancel" closes it
- "Save Job" submits `POST /api/jobs`; title is validated client-side before submit
- While saving: button disabled, shows "Saving..."
- On success: modal closes; page shows a brief "Job saved" confirmation
- On error: inline error message in the modal

### Hook: `frontend/src/hooks/useJobs.js`

- `createJob(data)` — `POST /api/jobs`, returns created job or throws
- Returns `{ createJob, creating, createError }`

---

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| Required field | title only | Company is often unknown at first contact |
| source | Always "manual" for this endpoint | Distinguishes from Gmail/Brave ingestion later |
| recruiter_info storage | Flat form fields → JSONB dict | Cleaner UX than a nested JSON textarea |
| Modal vs page | Modal on Jobs page | Stays in context; page-level forms come after Phase 6 (list view) |

---

## Out of Scope
- Job list display (Phase 6)
- Job detail page (Phase 7)
- Status updates (Phase 8)
- Deduplication (Phase 9B)
