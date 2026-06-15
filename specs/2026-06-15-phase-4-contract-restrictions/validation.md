# Phase 4 — Contract Restrictions: Validation

---

## 1. GET returns empty object before any save

```bash
curl -s http://localhost:8000/api/profile/restrictions
```

**Expected:** `200 {}` — no 404, no 500, no null.

---

## 2. PUT saves and GET reflects the change

```bash
curl -s -X PUT http://localhost:8000/api/profile/restrictions \
  -H "Content-Type: application/json" \
  -d '{
    "current_client": "Acme Corp",
    "current_vendor": "TechStaff Inc",
    "restricted_clients": ["GlobalBank", "MegaCorp"],
    "restricted_vendors": ["QuickHire LLC"],
    "noncompete_industries": ["Finance", "Healthcare"],
    "noncompete_locations": ["New York", "Boston"],
    "contract_end_date": "2026-12-31"
  }'
```

**Expected:** `200` with the full restrictions object echoed back.

```bash
curl -s http://localhost:8000/api/profile/restrictions
```

**Expected:** Same object returned — values match what was PUT.

---

## 3. Reload persists data (browser check)

1. Open `http://localhost:5174/profile`
2. Scroll to the Contract Restrictions section
3. Fill in: current client, at least one restricted client, contract end date
4. Click "Save Restrictions" — confirm "Saved" appears briefly
5. Hard reload the page (`Cmd+Shift+R`)
6. Confirm all saved fields are pre-populated

---

## 4. Partial PUT merges without clearing other fields

```bash
# First save some restrictions
curl -s -X PUT http://localhost:8000/api/profile/restrictions \
  -H "Content-Type: application/json" \
  -d '{"current_client": "Acme Corp", "contract_end_date": "2026-12-31"}'

# Then PUT only restricted_clients — current_client must survive
curl -s -X PUT http://localhost:8000/api/profile/restrictions \
  -H "Content-Type: application/json" \
  -d '{"restricted_clients": ["GlobalBank"]}'

# Confirm both fields present
curl -s http://localhost:8000/api/profile/restrictions
```

**Expected:** Response includes `current_client`, `contract_end_date`, AND `restricted_clients` — nothing wiped.

---

## Merge Checklist

- [ ] `GET /api/profile/restrictions` → `200 {}` before any save
- [ ] `PUT` with full payload → `200` with echoed restrictions
- [ ] `GET` after `PUT` returns same data
- [ ] Partial `PUT` merges — existing fields not cleared
- [ ] Unknown field in `PUT` body → `422` (Pydantic `extra="forbid"`)
- [ ] Form pre-populates on reload
- [ ] "Saved" confirmation shown after successful save
- [ ] `npm run build` exits 0
