# JobSense AI

A self-hosted AI career management assistant for technical professionals. JobSense automatically ingests recruiter opportunities, scores fit against your resume, detects contract conflicts, and tracks your full job pipeline — so you can focus on decisions, not administration.

Built with FastAPI, React, LangGraph, and Claude.

---

## What it does

- **Ingests opportunities** from recruiter emails (Gmail MCP) and manual entry
- **Scores resume fit** 1–10 against each job, with a plain-language explanation
- **Detects contract conflicts** across four categories: same end-client, same staffing vendor, non-compete by industry, non-compete by geography
- **Tracks the full pipeline** from discovery through offer, with active/archive board separation
- **Discovers jobs proactively** via Brave Search based on your preferences
- **Searches on demand** with natural-language queries — results ranked by fit score
- **Generates tailored cover letters** on demand; you review and submit manually
- **Deduplicates across all sources** — the same job is never added twice
- **Explains every decision** — all agent reasoning is logged and browsable

JobSense is a single-user personal tool. It is not a multi-tenant SaaS and does not auto-submit applications.

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python 3.11) + SQLAlchemy 2.0 async |
| Database | PostgreSQL via asyncpg + Alembic migrations |
| Agent framework | LangGraph |
| LLM | Claude claude-sonnet-4-6 via Anthropic API |
| MCP integrations | Gmail, Brave Search, Filesystem, Google Calendar, Google Drive |
| Frontend | React + Vite + Tailwind CSS |
| Deployment | Render free tier |

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (local or hosted)
- [uv](https://docs.astral.sh/uv/) — Python package manager (`pip install uv`)

---

## Quick start

### 1. Clone the repo

```bash
git clone https://github.com/MisSwa/JobSense.git
cd JobSense
```

### 2. Configure environment variables

```bash
cp .env.example backend/.env
```

Edit `backend/.env` and fill in your values:

```
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/jobsense
ANTHROPIC_API_KEY=your_key_here
BRAVE_SEARCH_API_KEY=your_key_here
GOOGLE_CLIENT_ID=your_key_here
GOOGLE_CLIENT_SECRET=your_key_here
```

### 3. Set up the database

```bash
cd backend
uv run alembic upgrade head
```

### 4. Start the backend

```bash
# from backend/
uv run uvicorn main:app --reload --port 8000
```

Verify: `curl http://localhost:8000/health` → `{"status":"ok","version":"0.1.0"}`
DB check: `curl http://localhost:8000/health/db` → `{"status":"ok","db":"connected"}`

### 5. Start the frontend

```bash
# from frontend/
npm install
npm run dev
```

Open `http://localhost:5173` — you should see the nav shell with a green API badge and a green Database Connected badge on the Dashboard.

---

## Project structure

```
JobSense/
├── backend/
│   ├── main.py                  # FastAPI app, lifespan, CORS, routers
│   ├── alembic/                 # Database migrations
│   │   └── versions/            # Migration files
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py        # DATABASE_URL from .env
│   │   │   └── database.py      # Async engine, session factory, get_db
│   │   ├── models/              # SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── job.py           # Status, employment type, conflict level enums
│   │   │   ├── suggestion.py
│   │   │   ├── agent_log.py
│   │   │   ├── application.py
│   │   │   ├── interview.py
│   │   │   └── feedback.py
│   │   └── routers/
│   │       └── health.py        # GET /health/db
│   └── tests/
│       └── test_health.py       # 4 pytest tests (200, status, version, CORS)
├── frontend/
│   └── src/
│       ├── components/
│       │   └── NavShell.jsx     # Nav bar + live API health badge
│       ├── hooks/
│       │   ├── useHealth.js     # Fetches GET /health
│       │   └── useHealthDb.js   # Fetches GET /health/db
│       └── pages/
│           ├── Dashboard.jsx    # DB status badge
│           ├── Jobs.jsx
│           ├── Discover.jsx
│           ├── Profile.jsx
│           ├── Suggestions.jsx
│           ├── Observability.jsx
│           └── Search.jsx
├── specs/                       # Phase specs (plan, requirements, validation)
├── .env.example
└── .gitignore
```

---

## Database schema

Seven tables managed by Alembic migrations:

| Table | Purpose |
|---|---|
| `users` | Resume text, file path, preferences (JSONB), contract restrictions (JSONB) |
| `jobs` | Full job details, fit score, conflict level, pipeline status, dedup hash |
| `suggestions` | AI-generated skill gap / resume / interview / career suggestions |
| `agent_logs` | Full input/output/reasoning for every agent node execution |
| `applications` | Cover letter, notes, follow-up date per job |
| `interviews` | Interview date, type, scorecard, outcome |
| `feedback` | User accuracy rating (1–5) on fit scores after terminal outcomes |

---

## Agent architecture

LangGraph graph with `JobSenseState` flowing through all nodes:

```
intake → research → scoring → conflict_detection → suggestions → evaluation
                                                         ↓
                                               cover_letter (on demand)
```

| Node | Does |
|---|---|
| `intake_node` | Extracts structured fields from raw job text |
| `research_node` | Company research and salary benchmarks via Brave Search |
| `scoring_node` | Scores resume fit 1–10 with plain-language explanation |
| `conflict_detection_node` | Checks four conflict types against stored restrictions |
| `suggestions_node` | Generates skill gap, resume keyword, interview prep suggestions |
| `cover_letter_node` | Drafts a tailored cover letter on demand |
| `evaluation_node` | Logs all decisions; powers the Observability page |

Every node logs to `agent_logs` — inputs, outputs, reasoning, and execution time.

---

## MCP integrations

All MCP servers run locally via stdio using `langchain-mcp-adapters`. Commands are configured via environment variables so you can point to your own server binaries.

| Integration | Role |
|---|---|
| Gmail MCP | Parse recruiter emails, extract structured job details |
| Brave Search MCP | Job discovery, company research, salary benchmarks |
| Filesystem MCP | Resume file access, cover letter drafts |
| Google Calendar MCP | Interview scheduling, follow-up reminders |
| Google Drive MCP | Cover letter and resume version storage |

Configure the commands in `backend/.env`:

```
GMAIL_MCP_COMMAND=
BRAVE_MCP_COMMAND=
FILESYSTEM_MCP_COMMAND=
CALENDAR_MCP_COMMAND=
DRIVE_MCP_COMMAND=
```

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string (`postgresql+asyncpg://...`) |
| `ANTHROPIC_API_KEY` | Yes (Phase 11+) | Claude API key |
| `BRAVE_SEARCH_API_KEY` | Yes (Phase 17+) | Brave Search API key |
| `GOOGLE_CLIENT_ID` | Yes (Phase 18+) | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes (Phase 18+) | Google OAuth client secret |
| `GMAIL_MCP_COMMAND` | Yes (Phase 18+) | Shell command to start Gmail MCP server |
| `BRAVE_MCP_COMMAND` | Yes (Phase 17+) | Shell command to start Brave Search MCP server |
| `FILESYSTEM_MCP_COMMAND` | Yes (Phase 19+) | Shell command to start Filesystem MCP server |
| `CALENDAR_MCP_COMMAND` | Yes (Phase 20+) | Shell command to start Calendar MCP server |
| `DRIVE_MCP_COMMAND` | Yes (Phase 21+) | Shell command to start Drive MCP server |

---

## Build status

| Phase | Description | Status |
|---|---|---|
| 0 | FastAPI + React scaffold, `GET /health`, nav shell | Done |
| 1 | PostgreSQL, SQLAlchemy models, Alembic, `GET /health/db` | Done |
| 2 | Resume upload — PDF/DOCX parsing, stored text | Planned |
| 3 | User preferences form | Planned |
| 4 | Contract restrictions form | Planned |
| 5 | Manual job entry | Planned |
| 6 | Job list view with filters | Planned |
| 7 | Job detail page | Planned |
| 8 | Job status update | Planned |
| 9 | Delete job | Planned |
| 10 | LangGraph graph scaffold + Observability page | Planned |
| 11+ | Agent nodes, MCP integrations, cover letters, analytics | Planned |

Full roadmap in [`specs/roadmap.md`](specs/roadmap.md).

---

## Running tests

```bash
cd backend
uv run pytest tests/ -v
```

---

## License

MIT
