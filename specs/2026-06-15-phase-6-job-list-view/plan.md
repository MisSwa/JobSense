# Phase 6 — Job List View: Plan

**Approach:** Vertical slice — endpoint → hook → list UI

---

## Group 1 — Backend GET endpoint

1. Add `GET /api/jobs` to `app/routers/jobs.py`:
   - Optional query params: `status: JobStatus | None`, `employment_type: EmploymentType | None`, `conflict_level: ConflictLevel | None`
   - Build a `SELECT` query with `WHERE` clauses for each non-None param
   - `ORDER BY created_at DESC`
   - Return `list[JobOut]`
2. Manual test:
   ```bash
   curl http://localhost:8000/api/jobs
   curl "http://localhost:8000/api/jobs?status=discovered"
   curl "http://localhost:8000/api/jobs?employment_type=contract"
   ```

---

## Group 2 — Frontend hook extension + list UI

3. Extend `frontend/src/hooks/useJobs.js`:
   - Add `jobs` state and `fetchJobs({ status, employment_type, conflict_level })` function
   - `loading` and `fetchError` state
   - Call `fetchJobs` on mount with no filters
4. Update `frontend/src/pages/Jobs.jsx`:
   - Add filter bar: three `<select>` dropdowns (Status, Employment Type, Conflict Level)
   - Filter change calls `fetchJobs` with new params
   - Map `jobs` array to `JobCard` component (inline)
   - Status badge colors: discovered=gray, applied=blue, screening=yellow, interview=purple, offer=green, rejected=red, withdrawn=gray
   - Fit score placeholder `—`
   - Empty state messages for no jobs vs. filtered-but-empty

---

## Group 3 — Verify & merge

5. `npm run build` — confirm no errors
6. Run curl validation sequence
7. Browser check: Jobs page shows existing jobs, filters work
8. Commit, merge to main, push
