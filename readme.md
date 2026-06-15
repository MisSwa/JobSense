# JobSense AI — Project Brief for Claude Code

## Project Overview
Build **JobSense**, an open source AI-powered career management assistant that helps job seekers intelligently discover, evaluate, and pursue job opportunities. It uses LangGraph agents, MCP server integrations, FastAPI backend, React frontend, SQLite database, and Claude LLM.

**GitHub Repo Name:** `jobsense-ai`
**License:** MIT
**Deployment Target:** Render (free tier)

---

## Problem Statement
Job seekers today receive high volumes of recruiter outreach across multiple channels but have no intelligent system to track, evaluate, and manage these opportunities. They manually assess job fit, miss follow-ups, and have no way to automatically detect contract conflicts or compliance risks. This leads to missed opportunities, wasted time, and potentially serious contractual violations.

JobSense solves this by automatically ingesting opportunities from emails and manual entry, scoring fit against the user's resume, flagging contract conflicts, tracking every stage of the process, and providing AI-powered career suggestions — all through a simple web interface.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Tailwind CSS |
| Backend | FastAPI (Python) |
| Agent Framework | LangGraph |
| LLM | Claude (claude-sonnet-4-6) via Anthropic API |
| MCP Servers | Gmail MCP, Brave Search MCP, Filesystem MCP, Google Calendar MCP, Google Drive MCP |
| Database | SQLite |
| Deployment | Render (free tier) |

---

## MCP Server Integrations

### 1. Gmail MCP
- Auto-reads recruiter emails
- Extracts job details from email body
- Identifies recruiter name, company, role, and contact info
- Triggers job ingestion pipeline automatically
- MCP URL: https://gmailmcp.googleapis.com/mcp/v1

### 2. Brave Search MCP
- Daily job discovery across the web
- Company research when a new job is added
- Latest news about target companies
- Salary benchmarking searches

### 3. Filesystem MCP
- Reads uploaded resume file
- Stores and retrieves job descriptions locally
- Saves cover letters and application drafts
- Manages exported reports

### 4. Google Calendar MCP
- Auto-schedule interview reminders
- Track follow-up dates
- Block prep time before interviews
- MCP URL: https://calendarmcp.googleapis.com/mcp/v1

### 5. Google Drive MCP
- Store resume versions
- Save cover letters
- Share job tracker exports
- MCP URL: https://drivemcp.googleapis.com/mcp/v1

---

## LangGraph Agent Architecture

### Agent Nodes

1. **intake_node** — Receives job from Gmail MCP or manual entry, extracts structured data
2. **research_node** — Uses Brave Search MCP to research company, role, salary benchmarks
3. **scoring_node** — Scores resume fit against job description (1-10) with explanation
4. **conflict_detection_node** — Checks job against user's contract restrictions and flags risks
5. **suggestions_node** — Generates personalized career advice and skill gap recommendations
6. **cover_letter_node** — Drafts tailored cover letter for Smart Apply
7. **evaluation_node** — Logs all agent decisions, scores accuracy, tracks performance
8. **orchestrator_node** — Routes between nodes based on state and user action

### State Schema
```python
class JobSenseState(TypedDict):
    job_id: str
    raw_input: str  # email or manual entry
    job_details: dict  # title, company, vendor, client, tech_stack, salary, location, type
    resume_text: str
    fit_score: float
    fit_explanation: str
    conflict_level: str  # green / yellow / red
    conflict_reasons: list
    suggestions: list
    cover_letter: str
    agent_decisions: list  # for observability
    errors: list
```

### Graph Flow
```
intake_node → research_node → scoring_node → conflict_detection_node → suggestions_node → evaluation_node
                                                                    ↓
                                                          cover_letter_node (on demand)
```

---

## Database Schema (SQLite)

### users
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT,
    resume_text TEXT,
    resume_file_path TEXT,
    created_at TIMESTAMP
);
```

### user_preferences
```sql
CREATE TABLE user_preferences (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    target_titles TEXT,  -- JSON array
    seniority_levels TEXT,  -- JSON array: junior/mid/senior/lead/principal
    employment_types TEXT,  -- JSON array: FTE/contract/contract-to-hire/part-time
    remote_preference TEXT,  -- remote/hybrid/onsite
    target_locations TEXT,  -- JSON array
    min_salary INTEGER,
    target_industries TEXT,  -- JSON array
    avoid_industries TEXT,  -- JSON array
    target_companies TEXT,  -- JSON array
    blacklisted_companies TEXT,  -- JSON array
    current_skills TEXT,  -- JSON array
    target_skills TEXT,  -- JSON array
    avoid_skills TEXT,  -- JSON array
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### contract_restrictions
```sql
CREATE TABLE contract_restrictions (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    current_client TEXT,  -- e.g. Bank of America
    current_vendor TEXT,  -- e.g. TEKsystems
    restricted_clients TEXT,  -- JSON array
    restricted_vendors TEXT,  -- JSON array
    non_compete_details TEXT,
    restriction_end_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### jobs
```sql
CREATE TABLE jobs (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    title TEXT,
    company TEXT,
    vendor TEXT,
    client TEXT,
    tech_stack TEXT,  -- JSON array
    salary_min INTEGER,
    salary_max INTEGER,
    location TEXT,
    employment_type TEXT,
    remote_type TEXT,
    job_description TEXT,
    source TEXT,  -- gmail/brave_search/manual
    source_url TEXT,
    recruiter_name TEXT,
    recruiter_email TEXT,
    fit_score REAL,
    fit_explanation TEXT,
    conflict_level TEXT,  -- green/yellow/red
    conflict_reasons TEXT,  -- JSON array
    status TEXT,  -- discovered/applied/screening/interview/offer/rejected/withdrawn
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### applications
```sql
CREATE TABLE applications (
    id INTEGER PRIMARY KEY,
    job_id INTEGER,
    user_id INTEGER,
    cover_letter TEXT,
    applied_at TIMESTAMP,
    follow_up_date DATE,
    notes TEXT,
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);
```

### interviews
```sql
CREATE TABLE interviews (
    id INTEGER PRIMARY KEY,
    job_id INTEGER,
    user_id INTEGER,
    interview_date TIMESTAMP,
    interview_type TEXT,  -- phone/video/onsite/technical
    interviewer_name TEXT,
    notes TEXT,
    scorecard TEXT,  -- JSON
    outcome TEXT,  -- passed/failed/pending
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);
```

### agent_logs
```sql
CREATE TABLE agent_logs (
    id INTEGER PRIMARY KEY,
    job_id INTEGER,
    node_name TEXT,
    input_data TEXT,  -- JSON
    output_data TEXT,  -- JSON
    decision_reasoning TEXT,
    execution_time_ms INTEGER,
    error TEXT,
    created_at TIMESTAMP
);
```

### suggestions
```sql
CREATE TABLE suggestions (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    suggestion_type TEXT,  -- skill_gap/resume_keyword/interview_prep/career_advice
    content TEXT,
    related_job_id INTEGER,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP
);
```

---

## API Endpoints (FastAPI)

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### User Profile
- `GET /api/profile`
- `PUT /api/profile`
- `POST /api/profile/resume` — upload resume
- `GET /api/profile/preferences`
- `PUT /api/profile/preferences`
- `GET /api/profile/restrictions`
- `PUT /api/profile/restrictions`

### Jobs
- `GET /api/jobs` — list all jobs with filters
- `POST /api/jobs` — manual job entry
- `GET /api/jobs/{id}` — job details
- `PUT /api/jobs/{id}/status` — update pipeline status
- `DELETE /api/jobs/{id}`
- `POST /api/jobs/discover` — trigger Brave Search discovery
- `POST /api/jobs/sync-gmail` — trigger Gmail MCP sync

### Applications
- `POST /api/jobs/{id}/apply` — Smart Apply
- `GET /api/jobs/{id}/cover-letter` — generate cover letter
- `PUT /api/applications/{id}`

### Interviews
- `POST /api/jobs/{id}/interviews`
- `PUT /api/interviews/{id}`
- `POST /api/interviews/{id}/scorecard`

### Suggestions
- `GET /api/suggestions`
- `PUT /api/suggestions/{id}/read`
- `GET /api/suggestions/weekly-summary`

### Observability
- `GET /api/agent-logs` — view all agent decisions
- `GET /api/agent-logs/{job_id}` — decisions for specific job
- `GET /api/analytics/fit-score-accuracy`
- `GET /api/analytics/pipeline-summary`

---

## Frontend Pages (React + Tailwind)

### 1. Dashboard
- Pipeline summary (counts by status)
- Recent jobs discovered
- Pending follow-ups
- Weekly suggestions summary
- Agent performance metrics

### 2. Jobs Board
- Kanban view by pipeline stage
- Filter by fit score, conflict level, employment type
- Color coded conflict indicators 🟢🟡🔴
- Sort by fit score, date, salary

### 3. Job Detail Page
- Full job description
- Fit score with explanation
- Conflict detection results
- Skills match/gap breakdown
- Recruiter contact info
- Timeline of all activity
- Smart Apply button
- Interview notes section

### 4. Discover Page
- Search preferences input
- Trigger manual discovery
- Gmail sync button
- Discovery history

### 5. Profile & Preferences
- Resume upload
- Role preferences form
- Skills profile
- Contract restrictions
- Company blacklist/target list

### 6. Suggestions Page
- All AI suggestions
- Filtered by type
- Weekly summary report

### 7. Observability Dashboard
- Agent decision log
- Fit score accuracy over time
- Node performance metrics
- Error tracking

---

## Module Breakdown & Build Phases

### Phase 1 — Foundation (Week 1-2)
- [ ] Project setup — FastAPI, React, SQLite
- [ ] Database schema creation
- [ ] Basic React UI with navigation
- [ ] Resume upload and text parsing
- [ ] User preference profile setup
- [ ] Manual job entry form
- [ ] Basic job list view

### Phase 2 — Intelligence (Week 3-4)
- [ ] LangGraph agent setup
- [ ] Resume fit scoring node
- [ ] Contract conflict detection node
- [ ] Job details extraction node
- [ ] Agent logging to SQLite

### Phase 3 — MCP Discovery (Week 5-6)
- [ ] Brave Search MCP integration
- [ ] Gmail MCP integration
- [ ] Auto job ingestion pipeline
- [ ] Deduplication logic
- [ ] Google Drive MCP for resume storage
- [ ] Google Calendar MCP for interview scheduling

### Phase 4 — Smart Apply (Week 7)
- [ ] Cover letter generation node
- [ ] One click apply flow
- [ ] Application status tracking
- [ ] Follow-up reminder system

### Phase 5 — Suggestions Engine (Week 8-9)
- [ ] Skill gap recommendations
- [ ] Resume keyword suggestions
- [ ] Weekly performance summary
- [ ] Career advice module
- [ ] Interview prep tips

### Phase 6 — Evaluation & Polish (Week 10)
- [ ] Observability dashboard
- [ ] Fit score accuracy tracking
- [ ] Error handling and fallbacks
- [ ] UI polish
- [ ] README and documentation
- [ ] Deploy to Render

---

## Project Structure
```
jobsense-ai/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── database.py              # SQLite connection and setup
│   ├── models/                  # SQLAlchemy models
│   │   ├── user.py
│   │   ├── job.py
│   │   ├── application.py
│   │   ├── interview.py
│   │   └── agent_log.py
│   ├── routers/                 # FastAPI route handlers
│   │   ├── auth.py
│   │   ├── profile.py
│   │   ├── jobs.py
│   │   ├── applications.py
│   │   ├── interviews.py
│   │   ├── suggestions.py
│   │   └── analytics.py
│   ├── agents/                  # LangGraph agents
│   │   ├── graph.py             # Main LangGraph graph
│   │   ├── nodes/
│   │   │   ├── intake.py
│   │   │   ├── research.py
│   │   │   ├── scoring.py
│   │   │   ├── conflict.py
│   │   │   ├── suggestions.py
│   │   │   ├── cover_letter.py
│   │   │   └── evaluation.py
│   │   └── state.py             # JobSenseState TypedDict
│   ├── mcp/                     # MCP server connections
│   │   ├── gmail.py
│   │   ├── brave_search.py
│   │   ├── filesystem.py
│   │   ├── calendar.py
│   │   └── drive.py
│   └── utils/
│       ├── resume_parser.py
│       └── deduplication.py
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── JobsBoard.jsx
│   │   │   ├── JobDetail.jsx
│   │   │   ├── Discover.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Suggestions.jsx
│   │   │   └── Observability.jsx
│   │   ├── components/
│   │   │   ├── JobCard.jsx
│   │   │   ├── FitScoreBadge.jsx
│   │   │   ├── ConflictIndicator.jsx
│   │   │   ├── PipelineKanban.jsx
│   │   │   └── AgentLogTable.jsx
│   │   └── App.jsx
│   └── package.json
├── .env.example
├── requirements.txt
├── README.md
├── CONTRIBUTING.md
└── LICENSE
```

---

## Environment Variables
```
ANTHROPIC_API_KEY=your_key_here
BRAVE_SEARCH_API_KEY=your_key_here
GOOGLE_CLIENT_ID=your_key_here
GOOGLE_CLIENT_SECRET=your_key_here
DATABASE_URL=sqlite:///./jobsense.db
SECRET_KEY=your_secret_key
```

---

## Key Design Principles
1. **Evaluation first** — every agent decision is logged and explainable
2. **User in control** — agent assists, human decides
3. **Privacy conscious** — all data stored locally in SQLite
4. **Conflict aware** — contract restrictions are first class citizens
5. **Production grade** — proper error handling, fallbacks, and observability throughout
6. **Open source friendly** — clean code, good docs, welcoming to contributors

---

## README Sections to Include
1. What is JobSense
2. Demo screenshot/gif
3. Features list
4. Tech stack
5. Architecture diagram
6. Quick start guide
7. Environment setup
8. Contributing guide
9. Roadmap
10. License

---

## LinkedIn Posts Plan
- **Post 1** — Project announcement with problem statement
- **Post 2** — Gmail MCP pulling recruiter emails automatically
- **Post 3** — Fit scoring working with explanation
- **Post 4** — Conflict detection demo
- **Post 5** — Launch post with GitHub link

---

## Instructions for Claude Code
1. Start with Phase 1 — set up the project structure exactly as shown above
2. Use Python 3.11+
3. Use SQLAlchemy for database ORM
4. Use LangGraph for agent orchestration
5. Use langchain-mcp-adapters for MCP connections
6. Every agent node must log its decisions to agent_logs table
7. All API responses must include proper error handling
8. React frontend must use Tailwind CSS utility classes only
9. Follow the state schema exactly as defined
10. Build evaluation and observability from day one — not as an afterthought