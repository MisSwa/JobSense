# Phase 9 — Delete Job: Plan

**Approach:** Vertical slice — endpoint → hook → UI

---

## Group 1 — Backend endpoint

1. Add `DELETE /api/jobs/{job_id}` to `app/routers/jobs.py`:
   - Fetch job by id; raise `404` if not found
   - `await db.delete(job)`
   - `await db.commit()`
   - Return `Response(status_code=204)`
2. Add `Response` to the FastAPI imports in `jobs.py`
3. Manual test:
   ```bash
   # Create a throwaway job, capture its id
   JOB_ID=$(curl -s -X POST http://localhost:8000/api/jobs \
     -H "Content-Type: application/json" \
     -d '{"title":"Temp","company":"Acme"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

   # Delete it
   curl -s -X DELETE http://localhost:8000/api/jobs/$JOB_ID -w "\nHTTP %{http_code}"
   # Expected: HTTP 204

   # Confirm it is gone
   curl -s http://localhost:8000/api/jobs/$JOB_ID -w "\nHTTP %{http_code}"
   # Expected: HTTP 404

   # Delete non-existent
   curl -s -X DELETE http://localhost:8000/api/jobs/9999 -w "\nHTTP %{http_code}"
   # Expected: HTTP 404
   ```

---

## Group 2 — Frontend hook

4. Add `deleteJob()` to `useJobDetail.js`:
   - State: `deleting` (bool), `deleteError` (string | null)
   - Calls `DELETE /api/jobs/${id}`
   - On `204`: invoke a passed-in `onDeleted` callback (navigate to `/jobs`)
   - On error: set `deleteError` with the response message or a fallback string
   - Expose `{ deleting, deleteError, deleteJob }`

---

## Group 3 — Frontend UI

5. Update `JobDetail.jsx`:
   - Import `useNavigate` from `react-router-dom` (already available via Vite React setup)
   - Add local state `confirmingDelete` (bool, default `false`)
   - Pass `onDeleted={() => navigate("/jobs")}` to `useJobDetail`
   - Render delete control in the header area (below or beside the status dropdown):
     - If `!confirmingDelete`: `<button onClick={() => setConfirmingDelete(true)}>Delete job</button>`
     - If `confirmingDelete`:
       - `<button onClick={deleteJob} disabled={deleting}>Confirm delete?</button>`
       - `<button onClick={() => setConfirmingDelete(false)}>Cancel</button>`
     - If `deleteError`: `<p className="text-red-600 text-sm">{deleteError}</p>` below buttons; reset `confirmingDelete` to false on error so user can retry

---

## Group 4 — Verify & merge

6. `npm run build` — confirm no errors
7. Run curl validation sequence from Group 1
8. Browser manual check:
   - Open any job detail page
   - Click "Delete job" — confirm/cancel buttons appear
   - Click "Cancel" — returns to single button, job still accessible
   - Click "Delete job" again → "Confirm delete?" → confirm
   - Redirects to `/jobs`; deleted job not in list
9. Commit, merge to main, push
