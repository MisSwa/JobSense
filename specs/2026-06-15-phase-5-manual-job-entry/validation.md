# Phase 5 — Manual Job Entry: Validation

---

## 1. POST creates a job and returns 201

```bash
curl -s -X POST http://localhost:8000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Engineer",
    "company": "Acme Corp",
    "location": "Remote",
    "employment_type": "contract",
    "salary_min": 120000,
    "salary_max": 160000,
    "tech_stack": ["Python", "FastAPI"],
    "vendor": "TechStaff Inc",
    "client": "GlobalBank",
    "source_url": "https://example.com/job/123",
    "recruiter_name": "Jane Smith",
    "recruiter_email": "jane@techstaff.com",
    "recruiter_phone": "555-1234",
    "raw_text": "Looking for a senior engineer..."
  }' -w "\nHTTP %{http_code}"
```

**Expected:** `201` with full `JobOut` JSON including `id`, `status: "discovered"`, `source: "manual"`.

---

## 2. title is required — missing title → 422

```bash
curl -s -X POST http://localhost:8000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"company": "Acme"}' -w "\nHTTP %{http_code}"
```

**Expected:** `422 Unprocessable Entity`.

---

## 3. Minimal payload (title only) works

```bash
curl -s -X POST http://localhost:8000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"title": "Staff Engineer"}' -w "\nHTTP %{http_code}"
```

**Expected:** `201` with the job record; all optional fields null.

---

## 4. source is always "manual"

The response from check 1 must include `"source": "manual"` — not user-supplied.

---

## 5. Browser check

1. Open `http://localhost:5174/jobs`
2. Click "Add Job" — modal opens
3. Leave title blank, click "Save Job" — validation error shown, no request sent
4. Fill in title "QA Engineer", click "Save Job"
5. "Job saved" message appears briefly; modal closes
6. No console errors

---

## Merge Checklist

- [ ] `POST /api/jobs` with full payload → `201` with `JobOut`
- [ ] Missing title → `422`
- [ ] Title-only payload → `201`
- [ ] Response includes `source: "manual"` and `status: "discovered"`
- [ ] `recruiter_info` JSONB contains name/email/phone
- [ ] Browser: modal opens/closes correctly
- [ ] Browser: blank title shows validation, does not submit
- [ ] Browser: successful save shows "Job saved" toast
- [ ] `npm run build` exits 0
