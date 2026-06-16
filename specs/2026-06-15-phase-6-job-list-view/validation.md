# Phase 6 — Job List View: Validation

---

## 1. GET /api/jobs returns all jobs

```bash
curl -s http://localhost:8000/api/jobs | python3 -c "import sys,json; jobs=json.load(sys.stdin); print(f'{len(jobs)} jobs, first: {jobs[0][\"title\"] if jobs else None}')"
```

**Expected:** Count matches jobs in DB; newest first.

---

## 2. Filter by status

```bash
curl -s "http://localhost:8000/api/jobs?status=discovered" | python3 -c "import sys,json; jobs=json.load(sys.stdin); print('all discovered:', all(j['status']=='discovered' for j in jobs))"
```

**Expected:** `all discovered: True`

---

## 3. Filter by employment_type

```bash
curl -s "http://localhost:8000/api/jobs?employment_type=contract" | python3 -c "import sys,json; jobs=json.load(sys.stdin); print('count:', len(jobs))"
```

**Expected:** Only contract jobs returned.

---

## 4. Unknown filter value → 422

```bash
curl -s "http://localhost:8000/api/jobs?status=bogus" -w "\nHTTP %{http_code}"
```

**Expected:** `422`

---

## 5. Browser check

1. Open `http://localhost:5174/jobs`
2. Confirm existing jobs appear as cards with title, company, status badge
3. Select "Contract" from Employment Type dropdown — list filters to contract jobs only
4. Clear filter — all jobs reappear
5. Click "Add Job", save a new job — it appears at the top of the list

---

## Merge Checklist

- [ ] `GET /api/jobs` returns all jobs ordered by `created_at DESC`
- [ ] `?status=discovered` filters correctly
- [ ] `?employment_type=contract` filters correctly
- [ ] Invalid filter value → `422`
- [ ] Browser: job cards visible with title, company, status badge
- [ ] Browser: filter dropdowns narrow the list
- [ ] Browser: empty state message when filters match nothing
- [ ] Browser: new job from modal appears at top after save
- [ ] `npm run build` exits 0
