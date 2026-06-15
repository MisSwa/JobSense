# Phase 4 — Contract Restrictions: Plan

**Approach:** Vertical slice (mirrors Phase 3 preferences pattern)

---

## Group 1 — Schema & GET endpoint

1. Create `backend/app/schemas/restrictions.py`:
   - `Restrictions` Pydantic model with all 7 fields Optional, `extra="forbid"`
2. Add `GET /api/profile/restrictions` to `app/routers/profile.py`:
   - Query `User id=1`
   - If `user.restrictions` is None or `{}`, return `{}`
   - Otherwise deserialise JSONB dict into `Restrictions` and return it
   - `response_model_exclude_none=True`
3. Manual test: `curl http://localhost:8000/api/profile/restrictions` → `{}`

---

## Group 2 — PUT endpoint

4. Add `PUT /api/profile/restrictions` to `app/routers/profile.py`:
   - Accept `Restrictions` request body
   - Load existing `user.restrictions` (or `{}`)
   - Merge: `existing | incoming.model_dump(exclude_none=True)`
   - Save merged dict back to `user.restrictions`
   - Return the full merged `Restrictions` object (`response_model_exclude_none=True`)
5. Manual test:
   ```bash
   curl -X PUT http://localhost:8000/api/profile/restrictions \
     -H "Content-Type: application/json" \
     -d '{"current_client":"Acme Corp","restricted_vendors":["TechStaff Inc"],"contract_end_date":"2026-12-31"}'
   curl http://localhost:8000/api/profile/restrictions
   ```

---

## Group 3 — Frontend restrictions form

6. Create `frontend/src/hooks/useRestrictions.js`:
   - `GET /api/profile/restrictions` on mount
   - `saveRestrictions(data)` function: `PUT /api/profile/restrictions`
   - Returns `{ restrictions, saveRestrictions, saving, saveError }`
7. Add restrictions form section to `frontend/src/pages/Profile.jsx` below preferences section:
   - Fields: current client (text), current vendor (text), restricted clients (comma-sep),
     restricted vendors (comma-sep), non-compete industries (comma-sep),
     non-compete locations (comma-sep), contract end date (date input)
   - Comma-separated inputs converted to arrays before PUT, arrays joined with `, ` for display
   - "Save Restrictions" button → `saveRestrictions(formState)`
   - Loading: "Saving..." + disabled; success: "Saved" for 2s; error: inline message

---

## Group 4 — Verify & merge

8. `npm run build` — confirm no errors
9. Run full curl validation sequence
10. Browser check: fill in restrictions, save, hard reload, confirm pre-populated
11. Commit, merge to main, push
