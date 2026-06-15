# Phase 0 — Project Bootstrap: Validation

**Branch:** `phase-0-project-bootstrap`
**Merge criteria:** All three gates below must pass before merging to `main`
**Version:** 1.1 (replanned)
**Date:** 2026-06-14

---

## Gate 1 — Automated: pytest (backend)

### Setup

```bash
cd backend
uv add --dev pytest httpx   # already done in plan step 1.3
```

### Test file: `backend/tests/test_health.py`

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_returns_200():
    response = client.get("/health")
    assert response.status_code == 200


def test_health_returns_ok_status():
    response = client.get("/health")
    assert response.json()["status"] == "ok"


def test_health_returns_version():
    response = client.get("/health")
    assert "version" in response.json()


def test_health_cors_header_for_frontend_origin():
    response = client.get(
        "/health",
        headers={"Origin": "http://localhost:5173"}
    )
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"
```

### Run

```bash
cd backend
uv run pytest tests/test_health.py -v
```

### Pass criteria

- All **4 tests** green (200, status ok, version present, CORS header correct)
- Zero import errors or warnings
- The CORS test confirms `http://localhost:5173` is explicitly allowed — not a wildcard

---

## Gate 2 — Automated: Vite production build (frontend)

### Run

```bash
cd frontend
npm run build
```

### Pass criteria

- Exits with code 0
- No JSX or import errors in output
- `frontend/dist/` directory created and non-empty
- No "Failed to resolve import" errors

---

## Gate 3 — Manual: Browser verification

Start both servers:

```bash
# Terminal 1
cd backend && uv run uvicorn main:app --reload --port 8000

# Terminal 2
cd frontend && npm run dev
```

Open `http://localhost:5173` and verify each item:

| # | Check | Expected result |
|---|---|---|
| 1 | Page loads | No blank screen, no console errors |
| 2 | Nav bar visible | "JobSense" + 7 nav links all visible |
| 3 | Health badge — API up | Shows green "API online" |
| 4 | Dashboard route | `/` renders heading "Dashboard" |
| 5 | Jobs route | `/jobs` renders heading "Jobs" |
| 6 | Discover route | `/discover` renders heading "Discover" |
| 7 | Profile route | `/profile` renders heading "Profile" |
| 8 | Suggestions route | `/suggestions` renders heading "Suggestions" |
| 9 | Observability route | `/observability` renders heading "Observability" |
| 10 | Search route | `/search` renders heading "Search" |
| 11 | API offline fallback | Stop the backend; badge turns red "API offline" within ~5 seconds |
| 12 | Direct URL navigation | Paste `http://localhost:5173/search` directly in the address bar — page loads without a 404 |

---

## Merge Checklist

Before opening a PR or merging to `main`:

- [ ] All 4 pytest tests pass: `uv run pytest tests/test_health.py -v`
- [ ] CORS test specifically passes (not just the 3 functional tests)
- [ ] `npm run build` exits 0 with no errors
- [ ] All 12 manual browser checks pass
- [ ] `.gitignore` excludes `backend/.venv/`, `frontend/node_modules/`, `frontend/dist/`, `.env`
- [ ] `.env.example` committed with all environment variable keys and empty values
- [ ] No hardcoded ports anywhere except `vite.config.js` proxy and uvicorn start command
- [ ] No custom CSS files, no inline `style` attributes (Tailwind utility classes only)
- [ ] `backend/tests/test_health.py` committed with all 4 tests
- [ ] All 7 stub pages exist in `src/pages/` and are wired in `App.jsx`
