# Phase 0 — Project Bootstrap: Requirements

**Branch:** `phase-0-project-bootstrap`
**Roadmap reference:** Phase 0
**Version:** 1.1 (replanned)
**Date:** 2026-06-14

---

## Scope

Phase 0 delivers the minimum viable scaffold: a running FastAPI backend with a health endpoint, and a running React frontend with a navigation shell that displays that health status. No database, no agents, no auth, no data persistence. Just the skeleton everything else builds on.

### In scope
- FastAPI app initialized and running on port 8000
- `GET /health` endpoint returning `{ "status": "ok", "version": "0.1.0" }`
- CORS configured to allow requests from `http://localhost:5173`
- React + Vite app initialized and running on port 5173
- Tailwind CSS configured
- React Router with **7 stub page components** (all final nav destinations stubbed now)
- Navigation shell visible on all routes with health status badge
- `.gitignore` and `.env.example` at project root

### Out of scope
- Database connection (Phase 1)
- Any real page content beyond stub headings
- Authentication
- Deployment configuration
- Any agent, MCP, or AI wiring

---

## Tooling Decisions (locked)

### Python — `uv`
`uv` is the package manager for the backend.

- Project initialized with `uv init` inside `backend/`
- Dependencies declared in `pyproject.toml`
- Virtualenv managed automatically by `uv` (`.venv/` inside `backend/`)
- To add a package: `uv add <package>`
- To run the server: `uv run uvicorn main:app --reload --port 8000`
- Dev dependencies (pytest, httpx): `uv add --dev pytest httpx`

### Frontend — `npm`
`npm` is the package manager for the frontend. `package-lock.json` is committed.

- App scaffolded with `npm create vite@latest`
- Dependencies installed with `npm install`
- Dev server: `npm run dev`
- Production build: `npm run build`

### Port assignments (do not change without updating both sides)

| Service | Port | URL |
|---|---|---|
| FastAPI dev server | 8000 | `http://localhost:8000` |
| Vite dev server | 5173 | `http://localhost:5173` |

### Navigation — all 7 stub pages in Phase 0

All seven final nav destinations are created as stub components now so every nav link works from day one. Stubs contain only a page heading — no invented placeholder content.

| Route | Component | Stub heading |
|---|---|---|
| `/` | `Dashboard.jsx` | "Dashboard" |
| `/jobs` | `Jobs.jsx` | "Jobs" |
| `/discover` | `Discover.jsx` | "Discover" |
| `/profile` | `Profile.jsx` | "Profile" |
| `/suggestions` | `Suggestions.jsx` | "Suggestions" |
| `/observability` | `Observability.jsx` | "Observability" |
| `/search` | `Search.jsx` | "Search" |

The Search page is stubbed here so the nav shell is complete for the lifetime of the project. The Search feature itself is built in Phase 17A.

---

## Project Structure After Phase 0

```
jobsense-ai/
├── backend/
│   ├── main.py              # FastAPI app, GET /health, CORS middleware
│   ├── pyproject.toml       # uv project manifest + dependencies
│   ├── .python-version      # pinned to 3.11
│   └── tests/
│       └── test_health.py   # pytest: 200, status ok, version, CORS header
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Jobs.jsx
│   │   │   ├── Discover.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Suggestions.jsx
│   │   │   ├── Observability.jsx
│   │   │   └── Search.jsx
│   │   ├── components/
│   │   │   └── NavShell.jsx     # nav bar + health badge
│   │   ├── hooks/
│   │   │   └── useHealth.js     # fetches GET /health, returns { status, loading, error }
│   │   ├── App.jsx              # BrowserRouter + NavShell + Routes
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js           # proxy /api and /health → localhost:8000
│   └── index.html
├── specs/
├── .env.example
├── .gitignore
└── readme.md
```

---

## Key Constraints (from tech-stack.md)

- Tailwind CSS **utility classes only** — no custom CSS files, no inline `style` attributes, no component library
- React Router for all client-side routing
- The health badge calls `GET /health` live on mount — it is never hardcoded green
- CORS must explicitly list `http://localhost:5173` as an allowed origin
- `uv` and `npm` are the only package managers used — no mixing

---

## Context

Phase 0 answers one question: "Can both servers start, talk to each other, and show something in the browser?" Every subsequent phase assumes this baseline is solid. The CORS configuration and health badge together confirm the full request path — from React fetch to FastAPI response — is working before any real features are built.
