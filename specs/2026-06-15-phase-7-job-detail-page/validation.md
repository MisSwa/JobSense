# Phase 7 — Job Detail Page: Validation

---

## 1. GET /api/jobs/{id} returns the job

```bash
curl -s http://localhost:8000/api/jobs/1 | python3 -c "import sys,json; j=json.load(sys.stdin); print(j['title'], j['status'])"
```

**Expected:** Prints the title and status of job 1.

---

## 2. Non-existent ID → 404

```bash
curl -s http://localhost:8000/api/jobs/9999 -w "\nHTTP %{http_code}"
```

**Expected:** `{"detail":"Job not found."}` with `HTTP 404`.

---

## 3. Browser — card click navigates to detail page

1. Open `http://localhost:5174/jobs`
2. Click any job card
3. URL changes to `/jobs/{id}`
4. Detail page shows title, status badge, all available fields
5. "← Back to Jobs" link returns to the list

---

## 4. Browser — direct URL for non-existent job

1. Navigate to `http://localhost:5174/jobs/9999`
2. Page shows "Job not found." and "← Back to Jobs" link

---

## Merge Checklist

- [ ] `GET /api/jobs/{id}` → `200 JobOut` for valid ID
- [ ] `GET /api/jobs/9999` → `404` with detail message
- [ ] Job cards are clickable links to `/jobs/:id`
- [ ] Detail page renders two-column layout with all fields
- [ ] Status badge correct color on detail page
- [ ] Tech stack shown as pills
- [ ] Recruiter info shown if set
- [ ] Raw text shown if set
- [ ] "← Back to Jobs" works
- [ ] Non-existent ID shows "Job not found." state
- [ ] `npm run build` exits 0
