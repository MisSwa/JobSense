# JobSense AI — Tech Stack

**Format:** Architecture Decision Records (ADR)
**Version:** 1.0
**Date:** 2026-06-14

---

## ADR-001: Backend Framework — FastAPI

**Context:** The backend needs to serve a REST API, integrate with a LangGraph agent system, handle file uploads, and be deployable on Render's free tier. Python is required because LangGraph and the Anthropic SDK are Python-native.

**Decision:** FastAPI (Python 3.11+)

**Consequences:**
- Automatic OpenAPI docs at `/docs` with zero extra work
- Native async support aligns well with LangGraph's async graph execution
- Pydantic models serve double duty as request/response validation and SQLAlchemy schema helpers
- Ruled out: Django (too much overhead for an API-only backend), Flask (no native async, no Pydantic integration)

---

## ADR-002: Database — PostgreSQL

**Context:** The app needs durable persistent storage across redeploys. SQLite was the original choice but is ephemeral on Render's free tier (wiped on each deploy). The app is single-user so database scale is not a concern.

**Decision:** PostgreSQL via Render's free PostgreSQL tier

**Consequences:**
- Data persists across redeploys and server restarts
- Render's free PostgreSQL tier has a 1GB storage limit and 90-day expiry on idle databases — acceptable for a personal self-hosted tool
- `TIMESTAMP WITH TIME ZONE` used on all timestamp fields
- Ruled out: SQLite (ephemeral on Render), MySQL (no meaningful advantage here)

---

## ADR-003: ORM and Migrations — SQLAlchemy + Alembic

**Context:** The app needs an ORM to interact with PostgreSQL from Python, and a migration tool to manage schema changes over time.

**Decision:** SQLAlchemy 2.0 (async) + Alembic for migrations

**Consequences:**
- SQLAlchemy 2.0 style with `DeclarativeBase` is cleaner and better typed than 1.x
- Alembic generates versioned migration files — schema changes are auditable and reversible
- `asyncpg` used as the async PostgreSQL driver
- Ruled out: Tortoise ORM (smaller community, less LangGraph interop), raw SQL (no migration story)

---

## ADR-004: Agent Framework — LangGraph

**Context:** The core intelligence of JobSense is a multi-step pipeline: ingest → research → score → conflict check → suggest → evaluate. This requires stateful, conditional routing between nodes with full observability of each step.

**Decision:** LangGraph

**Consequences:**
- `JobSenseState` TypedDict flows through all nodes — state is explicit and inspectable at every step
- Conditional edges handle on-demand nodes (e.g., cover letter only when requested)
- Every node logs inputs, outputs, and reasoning to `agent_logs` — observability is a first-class feature of the graph
- Ruled out: bare LangChain chains (no stateful routing), custom orchestrator (reinventing the wheel)

---

## ADR-005: LLM — Claude claude-sonnet-4-6 via Anthropic API

**Context:** All AI tasks (fit scoring, conflict reasoning, cover letter generation, suggestions) require a capable instruction-following LLM with long context support for processing full job descriptions and resumes.

**Decision:** `claude-sonnet-4-6` via the Anthropic Python SDK

**Consequences:**
- Strong performance on structured extraction and reasoning tasks
- Long context window handles full resume + job description in a single prompt
- Costs are per-token — the evaluation node and logging help track and optimize usage over time
- `ANTHROPIC_API_KEY` required in environment
- Ruled out: OpenAI GPT-4 (no strong reason to switch from Claude given the project's origin), local LLMs (Render free tier has no GPU)

---

## ADR-006: MCP Integrations — langchain-mcp-adapters (local stdio)

**Context:** The brief originally listed remote HTTP MCP URLs for Gmail, Calendar, and Drive. These URLs were placeholders — no such remote MCP endpoints exist from Google. MCP servers for Google services are community-built and run locally via stdio.

**Decision:** `langchain-mcp-adapters` with local stdio MCP servers for all five integrations

**Consequences:**
- Each MCP server runs as a local subprocess; the adapter wraps it as a LangChain tool usable by LangGraph nodes
- MCP server commands are configured via environment variables (not hardcoded) so each deployer can point to their own server binaries
- Gmail, Calendar, and Drive MCPs require Google OAuth — credentials stored in `.env` and passed to the subprocess
- Filesystem MCP reads from local paths configured per deployment
- Ruled out: Remote HTTP MCP (non-existent for these services), raw Google APIs (much higher integration complexity)

**MCP servers in use:**

| Integration | Role |
|---|---|
| Gmail MCP | Parse recruiter emails, extract job details |
| Brave Search MCP | Job discovery, company research, salary benchmarks |
| Filesystem MCP | Resume file access, cover letter drafts, exports |
| Google Calendar MCP | Interview scheduling, follow-up reminders, prep blocks |
| Google Drive MCP | Resume version storage, cover letter archiving |

---

## ADR-007: Resume Parsing — pdfplumber + python-docx

**Context:** Users upload resumes in PDF or DOCX format. The text must be extracted and stored as plain text for the scoring and suggestions nodes to process.

**Decision:** `pdfplumber` for PDF, `python-docx` for DOCX

**Consequences:**
- `pdfplumber` handles complex PDF layouts (multi-column, tables) better than PyPDF2
- `python-docx` is the standard library for DOCX extraction
- Extracted text stored in the `users.resume_text` column; file path stored in `users.resume_file_path`
- Supported formats are PDF and DOCX only — `.txt`, `.pages`, and other formats are rejected with a clear error
- Ruled out: PyPDF2 (weaker layout handling), Apache Tika (Java dependency, overkill)

---

## ADR-008: Frontend — React + Tailwind CSS

**Context:** The frontend needs a component-based UI with a clean, functional design. It does not need SSR, a backend-for-frontend, or a heavy component library.

**Decision:** React (Vite) + Tailwind CSS utility classes only

**Consequences:**
- Vite gives fast local dev and small production builds
- Tailwind utility classes only — no custom CSS files, no inline `style` attributes, no component library (no shadcn, no MUI)
- Conflict colors follow a strict system: green = `text-green-600 bg-green-100`, yellow = `text-yellow-600 bg-yellow-100`, red = `text-red-600 bg-red-100`
- Components in `src/components/`, pages in `src/pages/`, API hooks in `src/hooks/`
- Ruled out: Next.js (SSR not needed for a self-hosted personal tool), Vue/Svelte (team unfamiliarity), shadcn/MUI (adds abstraction layer that conflicts with Tailwind-only constraint)

---

## ADR-009: Deployment — Render Free Tier

**Context:** The app needs to be publicly deployable with minimal cost and configuration. It is an open source project intended to be self-hostable by individuals.

**Decision:** Render free tier — FastAPI backend as a Web Service, PostgreSQL as a managed database, React frontend as a Static Site

**Consequences:**
- Free Web Services on Render spin down after 15 minutes of inactivity — cold starts are slow (~30s). Acceptable for a personal tool; not suitable for high-traffic use
- Free PostgreSQL on Render expires after 90 days of inactivity — users must be aware and take backups
- React is deployed as a static site (Vite build output) — zero server cost
- Environment variables are set in Render's dashboard per service
- Ruled out: Railway, Fly.io (similar free tiers but less documentation for this stack), Vercel (frontend-optimized, backend is limited)

---

## Environment Variables

```
# LLM
ANTHROPIC_API_KEY=

# Search
BRAVE_SEARCH_API_KEY=

# Google OAuth (Gmail, Calendar, Drive MCP)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Database
DATABASE_URL=postgresql+asyncpg://user:password@host:port/dbname

# MCP stdio server commands (set per deployment)
GMAIL_MCP_COMMAND=
CALENDAR_MCP_COMMAND=
DRIVE_MCP_COMMAND=
FILESYSTEM_MCP_COMMAND=
BRAVE_MCP_COMMAND=
```
