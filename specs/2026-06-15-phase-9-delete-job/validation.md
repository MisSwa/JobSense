# Phase 9 — Delete Job: Validation

---

## 1. DELETE returns 204 and job is absent from list

```bash
# Create a job and capture its id
JOB_ID=$(curl -s -X POST http://localhost:8000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"title":"Delete Me","company":"Acme"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

# Delete it
curl -s -X DELETE http://localhost:8000/api/jobs/$JOB_ID -w "\nHTTP %{http_code}"
```

**Expected:** empty body, `HTTP 204`

```bash
# Confirm absent from list
curl -s http://localhost:8000/api/jobs | python3 -c \
  "import sys,json; ids=[j['id'] for j in json.load(sys.stdin)]; print('absent' if $JOB_ID not in ids else 'STILL PRESENT')"
```

**Expected:** `absent`

---

## 2. DELETE non-existent job → 404

```bash
curl -s -X DELETE http://localhost:8000/api/jobs/9999 -w "\nHTTP %{http_code}"
```

**Expected:** `HTTP 404`

---

## 3. GET on deleted job → 404

```bash
# Using same JOB_ID from test 1 (already deleted)
curl -s http://localhost:8000/api/jobs/$JOB_ID -w "\nHTTP %{http_code}"
```

**Expected:** `HTTP 404`

---

## 4. Browser: confirm flow redirects to /jobs

1. Open `http://localhost:5174/jobs/{id}` for any existing job
2. Click "Delete job" — page shows "Confirm delete?" and "Cancel" inline; original button is gone
3. Click "Confirm delete?"
4. Browser redirects to `http://localhost:5174/jobs`
5. The deleted job does not appear in the job list

**Expected:** redirect completed; job absent from list

---

## 5. Browser: Cancel aborts delete

1. Open any job detail page
2. Click "Delete job" — confirm/cancel appear
3. Click "Cancel" — single "Delete job" button reappears
4. Job is still accessible; refresh confirms it persists

**Expected:** job unchanged; no delete request sent

---

## Merge Checklist

- [ ] `DELETE /api/jobs/{id}` → `204 No Content`
- [ ] `GET /api/jobs/{id}` after delete → `404`
- [ ] Job absent from `GET /api/jobs` list after delete
- [ ] `DELETE /api/jobs/9999` → `404`
- [ ] Browser: "Delete job" shows confirm/cancel inline
- [ ] Browser: "Cancel" resets to single button; job unchanged
- [ ] Browser: "Confirm delete?" → redirects to `/jobs`; job not in list
- [ ] `npm run build` exits 0
