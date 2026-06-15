# Phase 0 — Project Bootstrap: Plan

**Branch:** `phase-0-project-bootstrap`
**Structure:** Group 1 — Backend, Group 2 — Frontend
**Version:** 1.1 (replanned)
**Date:** 2026-06-14

---

## Group 1 — Backend

### 1.1 — Create the backend directory and initialize with uv

```bash
mkdir backend && cd backend
uv init --no-workspace
echo "3.11" > .python-version
```

- `uv init` generates `pyproject.toml`, `main.py` stub, and `.venv/`
- Python version pinned to 3.11 via `.python-version`

### 1.2 — Add runtime dependencies

```bash
uv add fastapi "uvicorn[standard]"
```

Confirm both appear under `[project.dependencies]` in `pyproject.toml`.

### 1.3 — Add dev dependencies

```bash
uv add --dev pytest httpx
```

### 1.4 — Write `backend/main.py`

Replace the `uv init` stub with:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="JobSense AI", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "version": "0.1.0"}
```

### 1.5 — Create the tests directory and `test_health.py`

```bash
mkdir backend/tests
touch backend/tests/__init__.py
```

Write `backend/tests/test_health.py` — see validation.md for the full test content.

### 1.6 — Verify backend starts and all tests pass

```bash
cd backend
uv run uvicorn main:app --reload --port 8000   # confirm starts, no import errors
uv run pytest tests/test_health.py -v           # confirm all 4 tests green
```

Also confirm FastAPI's auto-docs load at `http://localhost:8000/docs`.

---

## Group 2 — Frontend

### 2.1 — Scaffold the React app with Vite

From the project root:

```bash
npm create vite@latest frontend -- --template react
cd frontend && npm install
```

Confirm dev server starts: `npm run dev` → `http://localhost:5173`

### 2.2 — Install and configure Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Update `tailwind.config.js` content paths:

```js
content: ["./index.html", "./src/**/*.{js,jsx}"]
```

Replace the body of `src/index.css` with only:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Remove all other CSS in `index.css`. Confirm a Tailwind class (e.g. `text-blue-500`) renders.

### 2.3 — Install React Router

```bash
npm install react-router-dom
```

### 2.4 — Configure the Vite proxy

In `vite.config.js`, add a server proxy so `/api` and `/health` requests forward to FastAPI:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
    }
  }
})
```

### 2.5 — Create all 7 stub page components

Create `src/pages/` and one `.jsx` file per route. Each file exports a single component returning only a heading:

| File | Export | Heading text |
|---|---|---|
| `Dashboard.jsx` | `Dashboard` | "Dashboard" |
| `Jobs.jsx` | `Jobs` | "Jobs" |
| `Discover.jsx` | `Discover` | "Discover" |
| `Profile.jsx` | `Profile` | "Profile" |
| `Suggestions.jsx` | `Suggestions` | "Suggestions" |
| `Observability.jsx` | `Observability` | "Observability" |
| `Search.jsx` | `Search` | "Search" |

### 2.6 — Create the `useHealth` hook

Create `src/hooks/useHealth.js`:

```js
import { useState, useEffect } from 'react'

export function useHealth() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/health')
      .then(r => r.json())
      .then(data => { setStatus(data.status); setLoading(false) })
      .catch(err => { setError(err); setLoading(false) })
  }, [])

  return { status, loading, error }
}
```

### 2.7 — Create `NavShell` with health badge

Create `src/components/NavShell.jsx`:

- App name "JobSense" on the left, linking to `/`
- 7 nav links using `<Link>` from `react-router-dom`: Dashboard, Jobs, Discover, Profile, Suggestions, Observability, Search
- Health badge on the right using `useHealth`:
  - Loading: gray chip, text "Checking..."
  - `status === "ok"`: `bg-green-100 text-green-600` chip, text "API online"
  - error or status not ok: `bg-red-100 text-red-600` chip, text "API offline"
- Use only Tailwind utility classes — no custom CSS

### 2.8 — Wire everything in `App.jsx`

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavShell from './components/NavShell'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import Suggestions from './pages/Suggestions'
import Observability from './pages/Observability'
import Search from './pages/Search'

export default function App() {
  return (
    <BrowserRouter>
      <NavShell />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/suggestions" element={<Suggestions />} />
        <Route path="/observability" element={<Observability />} />
        <Route path="/search" element={<Search />} />
      </Routes>
    </BrowserRouter>
  )
}
```

### 2.9 — Add `.gitignore` and `.env.example` at the project root

`.gitignore` must exclude:

```
backend/.venv/
frontend/node_modules/
frontend/dist/
*.pyc
__pycache__/
.env
```

`.env.example` lists all future environment variables with empty values:

```
ANTHROPIC_API_KEY=
BRAVE_SEARCH_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DATABASE_URL=
GMAIL_MCP_COMMAND=
CALENDAR_MCP_COMMAND=
DRIVE_MCP_COMMAND=
FILESYSTEM_MCP_COMMAND=
BRAVE_MCP_COMMAND=
```

### 2.10 — Full stack verification

Start both servers simultaneously:

```bash
# Terminal 1 — from backend/
uv run uvicorn main:app --reload --port 8000

# Terminal 2 — from frontend/
npm run dev
```

Open `http://localhost:5173` and verify:
- Nav shell renders with all 7 links
- Health badge shows green "API online"
- Each nav link routes to the correct stub page
