# Phase 5 — Manual Job Entry: Plan

**Approach:** Vertical slice — schema → endpoint → frontend modal

---

## Group 1 — Backend schema & endpoint

1. Create `backend/app/schemas/job.py`:
   - Import `EmploymentType` from `app.models.job`
   - `JobCreate`: title required, all other fields Optional
   - `JobOut`: full job response including id, status, timestamps
2. Create `backend/app/routers/jobs.py`:
   - `POST /api/jobs` accepting `JobCreate`
   - Sets `source = "manual"`, `status = JobStatus.discovered`
   - Builds `recruiter_info` dict from flat recruiter fields (drop None values)
   - Inserts Job row, commits, returns `JobOut` with status 201
3. Register `jobs_router` in `backend/main.py` at `/api` prefix
4. Manual test:
   ```bash
   curl -s -X POST http://localhost:8000/api/jobs \
     -H "Content-Type: application/json" \
     -d '{"title": "Senior Engineer", "company": "Acme", "location": "Remote", "employment_type": "contract"}'
   ```

---

## Group 2 — Frontend hook & modal

5. Create `frontend/src/hooks/useJobs.js`:
   - `createJob(data)` — POST /api/jobs
   - Returns `{ createJob, creating, createError }`
6. Replace `frontend/src/pages/Jobs.jsx` with full implementation:
   - Page heading + "Add Job" button
   - `AddJobModal` component (inline): all 14 form fields, cancel/save actions
   - `useJobs` hook wired to the save action
   - Modal open/close state managed in the page component
   - "Job saved" toast (brief inline message, 2s) after successful save

---

## Group 3 — Verify & merge

7. `npm run build` — confirm no errors
8. Run curl validation sequence
9. Browser check: open Jobs page, click Add Job, fill title, save, confirm "Job saved" appears
10. Commit, merge to main, push
