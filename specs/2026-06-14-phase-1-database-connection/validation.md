# Phase 1 — Database Connection: Validation

Phase 1 is complete and safe to merge when all four checks below pass.

---

## 1. `GET /health/db` returns 200 on valid connection

**Steps:**
1. Start backend with a valid `DATABASE_URL` pointing to a running PostgreSQL instance
2. `curl -s http://localhost:8000/health/db | python3 -m json.tool`

**Expected:**
```json
{
  "status": "ok",
  "db": "connected"
}
```
HTTP status: `200`

---

## 2. `GET /health/db` returns 503 on bad `DATABASE_URL`

**Steps:**
1. Set `DATABASE_URL` to an invalid value (e.g. `postgresql+asyncpg://bad:bad@localhost:9999/none`)
2. Start (or restart) the backend
3. `curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health/db`

**Expected:**
- HTTP status: `503`
- Response body contains `"status": "error"` and a non-empty `"detail"` string
- Backend does **not** crash with an unhandled 500

---

## 3. All tables exist in the database after `alembic upgrade head`

**Steps:**
1. Run `alembic upgrade head` against the target PostgreSQL instance
2. Connect via `psql` (or any DB client) and run `\dt`

**Expected — all seven tables present:**
- `users`
- `jobs`
- `suggestions`
- `agent_logs`
- `applications`
- `interviews`
- `feedback`

No extra tables; no missing tables; no migration errors in the Alembic output.

---

## 4. Frontend badge reflects live database state

**Steps:**

**Connected state:**
1. Start PostgreSQL, backend, and frontend
2. Open `http://localhost:5173` → Dashboard
3. Confirm a green badge reading "Database Connected" is visible

**Unreachable state:**
1. Stop PostgreSQL (or change `DATABASE_URL` to an invalid value and restart backend)
2. Reload `http://localhost:5173` → Dashboard
3. Confirm a red badge reading "Database Unreachable" is visible
4. No blank screen, no console-only error — the badge is the user-facing signal

---

## Merge Checklist

- [ ] `GET /health/db` → 200 with valid DB
- [ ] `GET /health/db` → 503 with invalid DB (no 500 crash)
- [ ] All 7 tables present after `alembic upgrade head`
- [ ] Green badge visible with DB running
- [ ] Red badge visible with DB unreachable
