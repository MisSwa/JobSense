# Phase 3 — User Preferences: Plan

**Approach:** Vertical slice

---

## Group 1 — Schema & GET endpoint

1. Create `backend/app/schemas/` package with `__init__.py`
2. Create `backend/app/schemas/preferences.py`:
   - `EmploymentTypeEnum` (str enum): `fte`, `contract`, `contract_to_hire`, `part_time`
   - `RemoteEnum` (str enum): `remote`, `hybrid`, `onsite`
   - `Preferences` Pydantic model with all fields Optional, `extra="forbid"`
3. Add `GET /api/profile/preferences` to `app/routers/profile.py`:
   - Query `User id=1`
   - If `user.preferences` is None or `{}`, return `{}`
   - Otherwise deserialise JSONB dict into `Preferences` and return it
4. Manual test: `curl http://localhost:8000/api/profile/preferences` → `{}`

---

## Group 2 — PUT endpoint

5. Add `PUT /api/profile/preferences` to `app/routers/profile.py`:
   - Accept `Preferences` request body
   - Load existing `user.preferences` (or `{}`)
   - Merge: `existing | incoming.model_dump(exclude_none=True)`
   - Save merged dict back to `user.preferences`
   - Return the full merged `Preferences` object
6. Manual test:
   ```bash
   curl -X PUT http://localhost:8000/api/profile/preferences \
     -H "Content-Type: application/json" \
     -d '{"target_titles":["Senior Engineer"],"remote_preference":"remote","salary_min":150000}'
   # Then GET to confirm merged result
   curl http://localhost:8000/api/profile/preferences
   ```

---

## Group 3 — Frontend preferences form

7. Create `frontend/src/hooks/usePreferences.js`:
   - `GET /api/profile/preferences` on mount
   - `savePreferences(data)` function: `PUT /api/profile/preferences`
   - Returns `{ preferences, savePreferences, saving, saveError }`
8. Add preferences form section to `frontend/src/pages/Profile.jsx`:
   - Local state initialised from `usePreferences` on mount
   - Fields: target titles (text), employment types (checkboxes), remote preference (radio),
     target locations (text), salary min/max (number), target industries (text), target skills (text)
   - Comma-separated inputs converted to arrays before PUT, arrays joined with `, ` for display
   - "Save Preferences" button → `savePreferences(formState)`
   - Loading: "Saving..." + disabled; success: "Saved" for 2s; error: inline message

---

## Group 4 — Reload persistence check

9. `npm run build` — confirm no errors
10. Restart backend, reload `/profile` — confirm form fields pre-populate from DB
11. Change a field, save, reload — confirm the change persisted
