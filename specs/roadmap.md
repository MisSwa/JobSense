# JobSense AI — Roadmap

**Granularity:** One endpoint or one component per phase
**Scope:** Every phase ships something visible in the browser
**Version:** 1.0
**Date:** 2026-06-14

---

## Phase 0 — Project Bootstrap

**Backend:** FastAPI app entry point with `GET /health` returning `{ "status": "ok" }`
**Frontend:** React + Vite scaffold with top-level navigation shell (Dashboard, Jobs, Discover, Profile, Suggestions, Observability links)
**Deliverable:** Visit `http://localhost:5173`, see the nav shell; API health check visible as a status badge in the UI

---

## Phase 1 — Database Connection

**Backend:** PostgreSQL connected via SQLAlchemy async; all tables created on startup; `GET /health/db` returns connection status
**Frontend:** Dashboard page with a "Database" status badge (green = connected, red = error)
**Deliverable:** Green DB badge visible in the browser

---

## Phase 2 — Resume Upload

**Backend:** `POST /api/profile/resume` — accepts PDF or DOCX, extracts text via pdfplumber / python-docx, stores text in DB
**Frontend:** Resume upload form on Profile page with success confirmation and extracted text preview
**Deliverable:** Upload a PDF, see extracted resume text appear in the UI

---

## Phase 3 — User Preferences

**Backend:** `GET /api/profile/preferences` + `PUT /api/profile/preferences`
**Frontend:** Preferences form on Profile page (target titles, employment types, remote preference, locations, salary, industries, skills)
**Deliverable:** Fill in preferences, save, reload and see them persisted

---

## Phase 4 — Contract Restrictions

**Backend:** `GET /api/profile/restrictions` + `PUT /api/profile/restrictions`
**Frontend:** Contract restrictions form on Profile page (current client/vendor, restricted clients/vendors, non-compete details, end date)
**Deliverable:** Configure contract restrictions, persist them

---

## Phase 5 — Manual Job Entry

**Backend:** `POST /api/jobs` — create a job with all fields
**Frontend:** Job entry form (modal or dedicated page) with all job fields
**Deliverable:** Enter a job manually, see it saved

---

## Phase 6 — Job List View

**Backend:** `GET /api/jobs` — list all jobs; support filter params (status, conflict_level, employment_type)
**Frontend:** Jobs page with a simple list of job cards (title, company, status, fit score placeholder)
**Deliverable:** See all entered jobs in a filterable list

---

## Phase 7 — Job Detail Page

**Backend:** `GET /api/jobs/{id}`
**Frontend:** Job detail page showing all fields: title, company, vendor, client, salary, tech stack, recruiter info, source
**Deliverable:** Click a job card, land on a full detail page

---

## Phase 8 — Job Status Update

**Backend:** `PUT /api/jobs/{id}/status`
**Frontend:** Status selector on job detail page (discovered → applied → screening → interview → offer → rejected → withdrawn)
**Deliverable:** Change a job's pipeline stage from the detail page

---

## Phase 9 — Delete Job

**Backend:** `DELETE /api/jobs/{id}`
**Frontend:** Delete button with confirmation dialog on job detail page; redirects to job list on success
**Deliverable:** Remove a job from the tracker

---

## Phase 10 — LangGraph Graph Scaffold

**Backend:** LangGraph graph initialized with `JobSenseState`; stub nodes that pass state through; `agent_logs` table wired; `GET /api/agent-logs` returns empty array
**Frontend:** Observability page with an agent log table (columns: job, node, timestamp, status) — empty but rendered
**Deliverable:** Observability page loads; empty agent log table is visible

---

## Phase 11 — Intake Node

**Backend:** `intake_node` — extracts structured job fields (title, company, vendor, client, tech stack, salary, location, type) from raw text input; logs to `agent_logs`
**Frontend:** Agent decisions panel on job detail page showing the intake node's log entry (input → output → reasoning)
**Deliverable:** Add a job via raw text, see structured extraction in the agent decisions panel

---

## Phase 12 — Scoring Node

**Backend:** `scoring_node` — scores resume fit 1–10 against the stored resume text; writes `fit_score` and `fit_explanation` to the job record; logs to `agent_logs`
**Frontend:** Fit score badge (`FitScoreBadge` component) on job cards and job detail page with the explanation text
**Deliverable:** Every job shows a fit score and explanation after ingestion

---

## Phase 13 — Conflict Detection Node

**Backend:** `conflict_detection_node` — checks all four conflict types (same end-client, same vendor, non-compete by industry, non-compete by geography) against stored restrictions; writes `conflict_level` and `conflict_reasons`; logs to `agent_logs`
**Frontend:** Conflict indicator (`ConflictIndicator` component) on job cards and detail page — green / yellow / red with reasons listed
**Deliverable:** Jobs with conflicts show the correct color and reason text

---

## Phase 14 — Suggestions Node

**Backend:** `suggestions_node` — generates skill gap, resume keyword, career advice, and interview prep suggestions per job; writes to `suggestions` table; logs to `agent_logs`
**Frontend:** Suggestions page listing all suggestions, filterable by type (skill_gap / resume_keyword / interview_prep / career_advice)
**Deliverable:** See AI-generated suggestions per job on the Suggestions page

---

## Phase 15 — Evaluation Node

**Backend:** `evaluation_node` — logs all agent decisions and node outputs for the full graph run; `GET /api/agent-logs/{job_id}` returns all log entries for a job
**Frontend:** Observability page populated with real log entries; clicking a log row shows full input/output JSON
**Deliverable:** Full agent decision trail visible for any processed job

---

## Phase 16 — Fit Score Feedback

**Backend:** `POST /api/jobs/{id}/feedback` — stores actual outcome + user accuracy rating (1–5); `GET /api/analytics/fit-score-accuracy` returns accuracy trend data
**Frontend:** Feedback form on job detail page after a terminal outcome (offer/rejected/withdrawn); accuracy chart on Observability page
**Deliverable:** Rate a fit score, see the accuracy trend update in observability

---

## Phase 17 — Brave Search MCP

**Backend:** Brave Search MCP wired via `langchain-mcp-adapters`; `research_node` uses it for company research and salary benchmarks; `POST /api/jobs/discover` triggers a keyword search and ingests results
**Frontend:** Discover page with a search input, trigger button, and a results list showing discovered jobs
**Deliverable:** Trigger a search from the UI, see discovered jobs appear

---

## Phase 18 — Gmail MCP

**Backend:** Gmail MCP wired via `langchain-mcp-adapters`; `POST /api/jobs/sync-gmail` reads unread recruiter emails, parses job details, ingests new jobs with deduplication
**Frontend:** Gmail sync button on Discover page; newly ingested jobs appear in the job list with source = `gmail`
**Deliverable:** Click sync, see recruiter emails parsed into structured jobs

---

## Phase 19 — Filesystem MCP

**Backend:** Filesystem MCP wired; used by `cover_letter_node` and resume upload to read/write local files; configured paths shown via `GET /api/profile`
**Frontend:** Profile page shows configured filesystem paths (resume path, drafts path)
**Deliverable:** Filesystem MCP operational; paths visible in Profile

---

## Phase 20 — Google Calendar MCP

**Backend:** Calendar MCP wired; `POST /api/jobs/{id}/interviews` can trigger calendar event creation for the interview date
**Frontend:** "Add to Calendar" button on interview entry form on job detail page
**Deliverable:** Schedule an interview, confirm it appears in Google Calendar

---

## Phase 21 — Google Drive MCP

**Backend:** Drive MCP wired; cover letters saved to Drive after generation; Drive link stored on the application record
**Frontend:** Drive link shown as a button in the application section of the job detail page
**Deliverable:** Generate a cover letter, see a link to the Drive-stored version

---

## Phase 22 — Cover Letter Node

**Backend:** `cover_letter_node` — generates a tailored cover letter for the job using resume + job description; `GET /api/jobs/{id}/cover-letter` triggers on demand and returns the draft
**Frontend:** "Generate Cover Letter" button on job detail page; cover letter preview in a readable panel
**Deliverable:** Generate and preview a tailored cover letter from any job detail page

---

## Phase 23 — Smart Apply

**Backend:** `POST /api/jobs/{id}/apply` — creates an application record with cover letter, pre-filled details, and sets status to `applied`
**Frontend:** "Smart Apply" button on job detail page; application package modal showing cover letter + key job details for the user to copy/use
**Deliverable:** Click Smart Apply, see the full application package ready to use

---

## Phase 24 — Application Tracking

**Backend:** `PUT /api/applications/{id}` — update notes, follow-up date
**Frontend:** Application notes field and follow-up date picker on job detail page; follow-up jobs listed on Dashboard
**Deliverable:** Set a follow-up date, see the job appear in the Dashboard follow-up list

---

## Phase 25 — Interview Entry

**Backend:** `POST /api/jobs/{id}/interviews` — log interview date, type, interviewer name, notes
**Frontend:** Interview entry form on job detail page; interview entries shown in a timeline
**Deliverable:** Log an interview and see it in the job timeline

---

## Phase 26 — Interview Scorecard

**Backend:** `POST /api/interviews/{id}/scorecard` + `PUT /api/interviews/{id}` — record scorecard and outcome (passed/failed/pending)
**Frontend:** Scorecard form and outcome selector on interview detail; outcome badge shown in job timeline
**Deliverable:** Record an interview outcome and see it reflected in the timeline

---

## Phase 27 — Suggestions Read Tracking

**Backend:** `PUT /api/suggestions/{id}/read`
**Frontend:** Unread badge on Suggestions nav link; "Mark as read" action per suggestion; read suggestions visually dimmed
**Deliverable:** Mark suggestions as read; badge count decrements

---

## Phase 28 — Weekly Suggestions Summary

**Backend:** `GET /api/suggestions/weekly-summary` — aggregates suggestions from the past 7 days by type
**Frontend:** Weekly summary card on Dashboard (e.g., "3 skill gaps identified, 2 resume keywords suggested")
**Deliverable:** Dashboard shows weekly AI summary

---

## Phase 29 — Pipeline Summary Analytics

**Backend:** `GET /api/analytics/pipeline-summary` — returns job counts by status
**Frontend:** Pipeline count cards on Dashboard (Discovered / Applied / Screening / Interview / Offer)
**Deliverable:** Dashboard shows live pipeline counts

---

## Phase 30 — Kanban Board View

**Backend:** No new endpoints; uses existing `GET /api/jobs` and `PUT /api/jobs/{id}/status`
**Frontend:** `PipelineKanban` component on Jobs page — columns per status, job cards draggable or click-to-move between columns
**Deliverable:** Visual kanban board for the job pipeline

---

## Phase 31 — Node Performance Metrics

**Backend:** `GET /api/analytics/node-performance` — aggregates average `execution_time_ms` and error rate per node from `agent_logs`
**Frontend:** Node performance table on Observability page (node name, avg time, error rate, total runs)
**Deliverable:** See which agent nodes are slow or error-prone

---

## Phase 32 — Error Handling Audit

**Backend:** All endpoints return structured `{ "error": "...", "status": "error" }` JSON — no unhandled 500s; all agent node exceptions caught, logged, and appended to `state["errors"]`
**Frontend:** Error states, loading states, and empty states implemented on all pages; no blank screens or console-only errors
**Deliverable:** Every user-facing error is friendly and actionable

---

## Phase 33 — Deploy to Render

**Backend:** FastAPI deployed as Render Web Service; PostgreSQL on Render managed database; all environment variables set in Render dashboard
**Frontend:** React static site deployed to Render Static Sites (Vite build)
**Deliverable:** Live URL; app fully functional in production

---

## Deferred (Future Milestones)

- Multi-tenant / multi-user support with authentication
- LinkedIn MCP integration
- Resume builder / editor
- Auto-application submission to job boards
- Mobile-friendly responsive polish pass
- Email notification system
