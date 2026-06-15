# Phase 1 — Database Connection: Plan

**Approach:** Backend first, then frontend

---

## Group 1 — Database Connection & SQLAlchemy Setup

1. Add dependencies to `backend/requirements.txt`: `sqlalchemy[asyncio]`, `asyncpg`, `alembic`, `python-dotenv`
2. Create `backend/app/core/config.py` — load `DATABASE_URL` from environment using `python-dotenv`
3. Create `backend/app/core/database.py` — async engine via `create_async_engine`, session factory via `async_sessionmaker`, `get_db` dependency yielding `AsyncSession`
4. Create `backend/app/models/` package with one file per table:
   - `base.py` — `DeclarativeBase` subclass
   - `user.py` — `User` model
   - `job.py` — `Job` model with all fields including `status` enum, `employment_type` enum, `conflict_level` enum
   - `suggestion.py` — `Suggestion` model with `type` enum
   - `agent_log.py` — `AgentLog` model with `status` enum
   - `application.py` — `Application` model
   - `interview.py` — `Interview` model with `outcome` enum
   - `feedback.py` — `Feedback` model
5. Create `backend/app/models/__init__.py` — import all models so Alembic can discover them

---

## Group 2 — Alembic Setup & Initial Migration

6. Run `alembic init backend/alembic` to scaffold the migrations directory
7. Update `backend/alembic/env.py`:
   - Import `Base` from `app.models.base`
   - Set `target_metadata = Base.metadata`
   - Configure async engine from `DATABASE_URL` for offline and online modes
8. Generate the initial migration: `alembic revision --autogenerate -m "initial schema"`
9. Review the generated migration file — confirm all tables and columns are present
10. Run `alembic upgrade head` against a local PostgreSQL instance; verify all tables exist via `psql \dt`

---

## Group 3 — `GET /health/db` Endpoint

11. Create `backend/app/routers/health.py` — add `GET /health` (already exists from Phase 0) and `GET /health/db`
12. `GET /health/db` implementation:
    - Inject `AsyncSession` via `get_db`
    - Execute `SELECT 1` to verify connectivity
    - Return `200 { "status": "ok", "db": "connected" }` on success
    - Catch `Exception`, return `503 { "status": "error", "db": "unreachable", "detail": str(e) }`
13. Register the health router in `backend/app/main.py`
14. Call `Base.metadata.create_all` on startup via a FastAPI `lifespan` handler (as a safety net alongside Alembic)
15. Manual test: `curl http://localhost:8000/health/db` → 200; set bad `DATABASE_URL` → 503

---

## Group 4 — Frontend Dashboard Status Badge

16. Create `frontend/src/hooks/useHealthDb.js` — `GET /api/health/db`, returns `{ status, loading, error }`
17. Create `frontend/src/pages/Dashboard.jsx` — calls `useHealthDb` on mount; renders:
    - Loading: neutral grey badge "Checking..."
    - Connected: `text-green-600 bg-green-100` badge "Database Connected"
    - Error: `text-red-600 bg-red-100` badge "Database Unreachable"
18. Wire Dashboard route in `frontend/src/App.jsx` (replace placeholder from Phase 0)
19. Manual test: start backend + frontend → green badge; stop PostgreSQL → red badge
