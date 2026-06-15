# Phase 3 — User Preferences: Validation

---

## 1. GET returns empty object before any save

```bash
# On a fresh DB (or after clearing preferences)
curl -s http://localhost:8000/api/profile/preferences
```

**Expected:** `200 {}` — no 404, no 500, no null.

---

## 2. PUT saves and GET reflects the change

```bash
curl -s -X PUT http://localhost:8000/api/profile/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "target_titles": ["Senior Engineer", "Staff Engineer"],
    "remote_preference": "remote",
    "salary_min": 150000,
    "salary_max": 200000,
    "employment_types": ["contract"],
    "target_skills": ["Python", "FastAPI"]
  }'
```

**Expected:** `200` with the full preferences object echoed back.

```bash
curl -s http://localhost:8000/api/profile/preferences
```

**Expected:** Same object returned — values match what was PUT.

---

## 3. Reload persists data (browser check)

1. Open `http://localhost:5174/profile`
2. Fill in at least: target titles, remote preference, salary min/max
3. Click "Save Preferences" — confirm "Saved" appears briefly
4. Hard reload the page (`Cmd+Shift+R`)
5. Confirm all saved fields are pre-populated

---

## 4. Partial PUT merges without clearing other fields

```bash
# First save some preferences
curl -s -X PUT http://localhost:8000/api/profile/preferences \
  -H "Content-Type: application/json" \
  -d '{"target_titles": ["Senior Engineer"], "salary_min": 150000}'

# Then PUT only salary_max — target_titles must survive
curl -s -X PUT http://localhost:8000/api/profile/preferences \
  -H "Content-Type: application/json" \
  -d '{"salary_max": 200000}'

# Confirm both fields present
curl -s http://localhost:8000/api/profile/preferences
```

**Expected:** Response includes `target_titles`, `salary_min`, AND `salary_max` — nothing wiped.

---

## Merge Checklist

- [ ] `GET /api/profile/preferences` → `200 {}` before any save
- [ ] `PUT` with full payload → `200` with echoed preferences
- [ ] `GET` after `PUT` returns same data
- [ ] Partial `PUT` merges — existing fields not cleared
- [ ] Unknown field in `PUT` body → `422` (Pydantic `extra="forbid"`)
- [ ] Form pre-populates on reload
- [ ] "Saved" confirmation shown after successful save
- [ ] `npm run build` exits 0
