# Phase 8 — Job Status Update: Plan

**Approach:** Vertical slice — schema → endpoint → hook → UI

---

## Group 1 — Backend schema & endpoint

1. Add `JobStatusUpdate` schema to `app/schemas/job.py`:
   ```python
   class JobStatusUpdate(BaseModel):
       status: JobStatus
   ```
2. Add `PUT /api/jobs/{job_id}/status` to `app/routers/jobs.py`:
   - Fetch job by id; 404 if not found
   - Set `job.status = body.status`
   - Commit and refresh
   - Return `JobOut`
3. Manual test:
   ```bash
   curl -X PUT http://localhost:8000/api/jobs/1/status \
     -H "Content-Type: application/json" -d '{"status": "applied"}'
   curl http://localhost:8000/api/jobs/1   # confirm status changed
   curl -X PUT http://localhost:8000/api/jobs/9999/status \
     -H "Content-Type: application/json" -d '{"status": "applied"}'  # → 404
   ```

---

## Group 2 — Frontend hook & detail page update

4. Extend `useJobDetail.js`:
   - Add `updateStatus(newStatus)` async function
   - Calls `PUT /api/jobs/{id}/status`
   - On success: updates `job` state with returned data
   - Exposes `updating` (bool) and `updateError` (string|null)
5. Update `JobDetail.jsx` header:
   - Replace static status badge span with a `<select>` dropdown
   - Options: all 7 JobStatus values with display labels
   - `onChange` calls `updateStatus`; dropdown disabled while `updating`
   - "Saved" flash (green, 2s) on success
   - Inline error text on failure
   - Status badge color still derived from current `job.status` (applied to the select's container or a colored dot next to it)

---

## Group 3 — Verify & merge

6. `npm run build` — confirm no errors
7. Run curl validation sequence
8. Browser: change status on detail page, reload — confirm it persisted
9. Commit, merge to main, push
