# Phase 9A — Active/Archive Board View: Plan

**Approach:** Backend param → hook extensions → UI

---

## Group 1 — Backend: view param

1. Add `ACTIVE_STATUSES` and `ARCHIVE_STATUSES` constants above `list_jobs` in `app/routers/jobs.py`
2. Add `view: Optional[str] = Query(default='active')` to `list_jobs`
3. Apply view filter before the existing `status` filter (AND compound):
   ```python
   if view == 'active':
       stmt = stmt.where(Job.status.in_(ACTIVE_STATUSES))
   elif view == 'archive':
       stmt = stmt.where(Job.status.in_(ARCHIVE_STATUSES))
   ```
4. Manual test:
   ```bash
   curl "http://localhost:8000/api/jobs"               # active only
   curl "http://localhost:8000/api/jobs?view=archive"  # archive only
   curl "http://localhost:8000/api/jobs?view=active&status=screening"  # compound
   ```

---

## Group 2 — Hook: fetchCounts, reopenJob

5. In `useJobs.js`, add `activeCount` and `archiveCount` state (default `null`)
6. Add `fetchCounts()` — parallel `Promise.all` fetch of `?view=active` and `?view=archive`; sets counts from `data.length`
7. Update `fetchJobs` to include `filters.view` in `URLSearchParams`
8. Add `reopenJob(id)` — `PUT /api/jobs/{id}/status` with `{ status: 'discovered' }`; returns bool
9. Export `activeCount`, `archiveCount`, `fetchCounts`, `reopenJob`

---

## Group 3 — UI: tabs, status filter, archive card

10. Add `ACTIVE_STATUS_OPTIONS` and `ARCHIVE_STATUS_OPTIONS` constants to `Jobs.jsx`
11. Add `view` state (default `'active'`) in `Jobs` component
12. Add `handleTabChange(newView)` — sets `view`, resets `filters.status` to `''`
13. Call `fetchCounts()` on mount (separate `useEffect`) and after `handleSaved` / `handleReopen`
14. Update the main `useEffect` to pass `view` in filters: `fetchJobs({ view, ...filters })`
15. Insert tab bar above the filter bar:
    - Two `<button>` tabs with active/inactive styles
    - Count badges from `activeCount` / `archiveCount`
16. Replace `STATUS_OPTIONS` in the filter `<select>` with `view === 'active' ? ACTIVE_STATUS_OPTIONS : ARCHIVE_STATUS_OPTIONS`
17. Add `ArchiveJobCard` component:
    - `div` wrapper (not `Link`) matching `JobCard` layout
    - Inner `Link` for title/details navigation
    - Reopen `button` in top-right area
18. Add `handleReopen(id)` in `Jobs` — calls `reopenJob(id)`, then `fetchJobs` + `fetchCounts`
19. Render `ArchiveJobCard` when `view === 'archive'`, `JobCard` when `view === 'active'`
20. Update empty state messages to be tab-aware

---

## Group 4 — Verify & merge

21. `npm run build` — confirm no errors
22. Run curl sequence from Group 1
23. Browser checks:
    - Jobs page loads on Active tab by default
    - Set a job to Rejected on detail page → return to Jobs → job is gone from Active
    - Switch to Archive tab → rejected job appears
    - Click Reopen → job disappears from Archive; switch to Active → job is there as Discovered
    - Cancel button on archive card does nothing (no cancel — reopen is one-click)
    - Status sub-filter on Active tab shows only active statuses; on Archive only archive statuses
24. Commit, merge to main, push
