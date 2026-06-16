# Phase 8 — Job Status Update: Validation

---

## 1. PUT updates the status and returns the job

```bash
curl -s -X PUT http://localhost:8000/api/jobs/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "applied"}' | python3 -c "import sys,json; j=json.load(sys.stdin); print(j['id'], j['status'])"
```

**Expected:** `1 applied`

---

## 2. GET confirms the status persisted

```bash
curl -s http://localhost:8000/api/jobs/1 | python3 -c "import sys,json; j=json.load(sys.stdin); print(j['status'])"
```

**Expected:** `applied`

---

## 3. Invalid status → 422

```bash
curl -s -X PUT http://localhost:8000/api/jobs/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "bogus"}' -w "\nHTTP %{http_code}"
```

**Expected:** `422`

---

## 4. Non-existent job → 404

```bash
curl -s -X PUT http://localhost:8000/api/jobs/9999/status \
  -H "Content-Type: application/json" \
  -d '{"status": "applied"}' -w "\nHTTP %{http_code}"
```

**Expected:** `404`

---

## 5. Round-trip all statuses

```bash
for s in discovered applied screening interview offer rejected withdrawn; do
  result=$(curl -s -X PUT http://localhost:8000/api/jobs/1/status \
    -H "Content-Type: application/json" -d "{\"status\": \"$s\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])")
  echo "$s → $result"
done
```

**Expected:** Each status echoed back correctly.

---

## 6. Browser check

1. Open `http://localhost:5174/jobs/1`
2. Header shows a status dropdown pre-selected to current status
3. Change to "Screening" — "Saved" flash appears briefly
4. Hard reload — status dropdown still shows "Screening"
5. Change to "Rejected" — badge/dot updates to red

---

## Merge Checklist

- [ ] `PUT /api/jobs/{id}/status` → `200 JobOut` with updated status
- [ ] `GET` after PUT confirms persistence
- [ ] Invalid status → `422`
- [ ] Non-existent job → `404`
- [ ] All 7 statuses accepted
- [ ] Browser: dropdown pre-populated with current status
- [ ] Browser: change saves immediately, "Saved" flash shown
- [ ] Browser: reload confirms persistence
- [ ] `npm run build` exits 0
