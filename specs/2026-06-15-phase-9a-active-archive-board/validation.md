# Phase 9A — Active/Archive Board View: Validation

---

## 1. Default GET /api/jobs returns only active statuses

```bash
curl -s http://localhost:8000/api/jobs | python3 -c "
import sys, json
jobs = json.load(sys.stdin)
statuses = {j['status'] for j in jobs}
bad = statuses - {'discovered','screening','interview','offer'}
print('PASS' if not bad else f'FAIL — unexpected statuses: {bad}')
"
```

**Expected:** `PASS`

---

## 2. ?view=archive returns only archive statuses

```bash
curl -s "http://localhost:8000/api/jobs?view=archive" | python3 -c "
import sys, json
jobs = json.load(sys.stdin)
statuses = {j['status'] for j in jobs}
bad = statuses - {'applied','rejected','withdrawn'}
print('PASS' if not bad else f'FAIL — unexpected statuses: {bad}')
"
```

**Expected:** `PASS`

---

## 3. view + status compound (AND)

```bash
# Create a screening job first if needed, then:
curl -s "http://localhost:8000/api/jobs?view=active&status=screening" | python3 -c "
import sys, json
jobs = json.load(sys.stdin)
bad = [j for j in jobs if j['status'] != 'screening']
print('PASS' if not bad else f'FAIL — non-screening jobs returned: {len(bad)}')
"
```

**Expected:** `PASS` (all returned jobs have status `screening`)

---

## 4. Rejected job moves between tabs

```bash
# Set job 1 to rejected
curl -s -X PUT http://localhost:8000/api/jobs/1/status \
  -H "Content-Type: application/json" -d '{"status":"rejected"}'

# Should not appear in active
ACTIVE=$(curl -s "http://localhost:8000/api/jobs?view=active" | python3 -c "import sys,json; print([j['id'] for j in json.load(sys.stdin)])")
echo "Active IDs: $ACTIVE"

# Should appear in archive
ARCHIVE=$(curl -s "http://localhost:8000/api/jobs?view=archive" | python3 -c "import sys,json; print([j['id'] for j in json.load(sys.stdin)])")
echo "Archive IDs: $ARCHIVE"
```

**Expected:** `1` absent from active list, present in archive list

---

## 5. Browser: active tab is default

1. Open `http://localhost:5174/jobs`
2. "Active" tab is selected (blue underline); "Archive" tab is not
3. Only jobs with statuses Discovered/Screening/Interview/Offer appear

**Expected:** active tab selected; no applied/rejected/withdrawn in the list

---

## 6. Browser: rejected job disappears from Active, appears in Archive

1. Open any active job's detail page
2. Change status to "Rejected"
3. Navigate back to `/jobs`
4. Job is not in the Active list
5. Click "Archive" tab — job appears with "rejected" badge

**Expected:** job moved to Archive automatically

---

## 7. Browser: Reopen returns job to Active

1. On Archive tab, find the rejected job from test 6
2. Click "Reopen"
3. Job disappears from Archive tab
4. Switch to Active tab — job appears with "discovered" badge
5. Count badges update correctly

**Expected:** job in Active as Discovered; archive count decremented; active count incremented

---

## 8. Browser: status filter scoped to current tab

1. Active tab: status dropdown shows only Discovered, Screening, Interview, Offer
2. Archive tab: status dropdown shows only Applied, Rejected, Withdrawn

**Expected:** no cross-tab status options visible

---

## Merge Checklist

- [ ] `GET /api/jobs` (no params) → only active statuses
- [ ] `GET /api/jobs?view=archive` → only archive statuses
- [ ] `view=active&status=screening` → only screening jobs
- [ ] `view=bogus` → 422
- [ ] Browser: Active tab default on load
- [ ] Browser: count badges visible on both tabs
- [ ] Browser: rejected job absent from Active, present in Archive
- [ ] Browser: Reopen moves job to Active as Discovered
- [ ] Browser: status filter options scoped to current tab
- [ ] `npm run build` exits 0
