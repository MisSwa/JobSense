# Phase 7 — Job Detail Page: Plan

**Approach:** Vertical slice — endpoint → hook → detail page → link cards

---

## Group 1 — Backend GET /api/jobs/{id}

1. Add `GET /api/jobs/{id}` to `app/routers/jobs.py`:
   - Query by primary key
   - Return `JobOut` on hit; raise `HTTPException(404)` on miss
2. Manual test:
   ```bash
   curl http://localhost:8000/api/jobs/1        # → 200
   curl http://localhost:8000/api/jobs/9999     # → 404
   ```

---

## Group 2 — Frontend hook, detail page, card links

3. Create `frontend/src/hooks/useJobDetail.js`:
   - Fetch `GET /api/jobs/{id}` on mount
   - Returns `{ job, loading, notFound }`

4. Create `frontend/src/pages/JobDetail.jsx`:
   - "← Back to Jobs" link + created date in header
   - Two-column grid:
     - Left: title, status badge, labeled field rows, fit score placeholder, conflict placeholder
     - Right: tech stack pills, recruiter info, raw job description
   - Not-found state when `notFound` is true

5. Add `/jobs/:id` route to `App.jsx`

6. Make job cards in `Jobs.jsx` clickable:
   - Wrap `JobCard` in `<Link to={/jobs/${job.id}}>` from react-router-dom
   - Remove underline/default link styles; card hover effect

---

## Group 3 — Verify & merge

7. `npm run build` — confirm no errors
8. Run curl validation
9. Browser check: click a card → detail page; back → list; test 404 route
10. Commit, merge to main, push
