# Phase 1 — Database Connection: Requirements

**Phase:** 1
**Date:** 2026-06-14
**Branch:** `phase-1-database-connection`
**Depends on:** Phase 0 (FastAPI app entry point, React scaffold)

---

## Scope

Wire up PostgreSQL, define and create all application tables, configure Alembic migrations, expose a `/health/db` endpoint, and show a live connection status badge on the Dashboard.

This phase establishes the full database schema upfront so every subsequent phase can add data without revisiting table creation.

---

## Backend Deliverables

### DB Connection
- `DATABASE_URL` loaded from environment via `python-dotenv`; format: `postgresql+asyncpg://user:password@host:port/dbname`
- SQLAlchemy 2.0 async engine created with `create_async_engine`; session factory via `async_sessionmaker`
- `asyncpg` is the async PostgreSQL driver (see ADR-003)
- Engine created once at startup; sessions injected via FastAPI dependency

### Tables — All Created in This Phase

| Table | Key Columns |
|---|---|
| `users` | `id`, `resume_text`, `resume_file_path`, `preferences` (JSONB), `restrictions` (JSONB), `created_at`, `updated_at` |
| `jobs` | `id`, `title`, `company`, `vendor`, `client`, `salary_min`, `salary_max`, `tech_stack` (JSONB), `location`, `employment_type`, `status`, `fit_score`, `fit_explanation`, `conflict_level`, `conflict_reasons` (JSONB), `source`, `source_url`, `dedup_hash`, `recruiter_info` (JSONB), `raw_text`, `created_at`, `updated_at` |
| `suggestions` | `id`, `job_id` (FK → jobs), `type` (enum: skill_gap / resume_keyword / interview_prep / career_advice), `content`, `is_read`, `created_at` |
| `agent_logs` | `id`, `job_id` (FK → jobs, nullable), `node`, `status` (enum: success / error), `input_data` (JSONB), `output_data` (JSONB), `reasoning`, `execution_time_ms`, `created_at` |
| `applications` | `id`, `job_id` (FK → jobs, unique), `cover_letter`, `notes`, `follow_up_date`, `created_at`, `updated_at` |
| `interviews` | `id`, `job_id` (FK → jobs), `interview_date`, `interview_type`, `interviewer_name`, `notes`, `scorecard` (JSONB), `outcome` (enum: passed / failed / pending), `created_at`, `updated_at` |
| `feedback` | `id`, `job_id` (FK → jobs, unique), `actual_outcome`, `accuracy_rating` (int 1–5), `created_at` |

All timestamp columns use `TIMESTAMP WITH TIME ZONE` (see ADR-002).

### Alembic
- Alembic initialized in `backend/alembic/`
- `env.py` configured to use the async SQLAlchemy engine and import all models
- Initial migration generated from the models above; migration file committed
- `alembic upgrade head` runs against a real PostgreSQL instance to verify the migration applies cleanly

### Endpoint: `GET /health/db`
- Returns `200 { "status": "ok", "db": "connected" }` when PostgreSQL is reachable
- Returns `503 { "status": "error", "db": "unreachable", "detail": "<error message>" }` when the connection fails — no unhandled 500

---

## Frontend Deliverables

### Dashboard Page
- Route: `/` (already scaffolded in Phase 0 nav shell)
- Calls `GET /health/db` on mount
- Shows a status badge:
  - Green (`text-green-600 bg-green-100`): "Database Connected"
  - Red (`text-red-600 bg-red-100`): "Database Unreachable"
- Loading state shown while the fetch is in flight
- Error state shown if the network request itself fails

---

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| Create all tables now vs incrementally | All tables in Phase 1 | Avoids repeated schema migrations across phases; Alembic tracks changes from here |
| Alembic now vs later | Now | Future phases will add columns; having a migration baseline prevents schema drift |
| Tables created via | SQLAlchemy models → Alembic autogenerate → `upgrade head` | Keeps ORM and DB in sync; migration is auditable |
| Session injection | FastAPI `Depends` with `AsyncSession` | Standard pattern for async FastAPI; avoids global session state |
| Health check failure response | 503 (not 500) | Caller can distinguish "service knows DB is down" from "service crashed" |

---

## Out of Scope

- Seeding data
- Authentication or multi-user separation
- Any CRUD endpoints beyond `/health/db`
- Frontend pages other than the Dashboard status badge
