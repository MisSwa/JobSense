# Phase 2 — Resume Upload: Validation

Phase 2 is complete and safe to merge when all four checks below pass.

---

## 1. POST /api/profile/resume returns extracted text

**Steps:**
1. Start the backend with a valid `DATABASE_URL`
2. Upload a real PDF:
   ```bash
   curl -s -F "file=@/path/to/resume.pdf" http://localhost:8000/api/profile/resume
   ```
3. Upload a real DOCX:
   ```bash
   curl -s -F "file=@/path/to/resume.docx" http://localhost:8000/api/profile/resume
   ```

**Expected:**
- HTTP `200`
- Response body: `{ "resume_text": "<non-empty string>" }`
- Text contains recognisable content from the uploaded file

---

## 2. Text persisted in DB

**Steps:**
1. After a successful upload, query the database:
   ```bash
   psql $DATABASE_URL -c "SELECT LENGTH(resume_text), resume_file_path FROM users WHERE id=1;"
   ```

**Expected:**
- `length` is greater than 0
- `resume_file_path` is `uploads/resume.pdf` or `uploads/resume.docx`
- Row exists (seed user was created on startup)

---

## 3. Unsupported format rejected with clear error

**Steps:**
1. Upload a `.txt` file:
   ```bash
   curl -s -o /tmp/err.json -w "%{http_code}" \
     -F "file=@/path/to/any.txt" \
     http://localhost:8000/api/profile/resume
   ```
2. Check the response body in `/tmp/err.json`

**Expected:**
- HTTP `422`
- Response contains `"Unsupported file type. Upload a PDF or DOCX."`
- Backend does not crash (no 500)

---

## 4. Frontend shows text preview

**Steps:**
1. Start both backend and frontend
2. Open `http://localhost:5173/profile`
3. Upload a PDF via the form
4. Observe the page without reloading

**Expected:**
- Button shows "Uploading..." while the request is in flight
- After success: extracted text appears in the "Extracted resume text" panel
- Reload the page: text is still shown (loaded from `GET /api/profile` on mount)
- Upload a `.txt` file: inline error message appears below the form — no blank screen

---

## Merge Checklist

- [ ] PDF upload → 200 with non-empty `resume_text`
- [ ] DOCX upload → 200 with non-empty `resume_text`
- [ ] `resume_text` and `resume_file_path` populated in DB after upload
- [ ] `.txt` upload → 422 with clear error message (no 500)
- [ ] Frontend text preview appears after upload without page reload
- [ ] Page reload re-loads existing text from `GET /api/profile`
- [ ] Re-upload overwrites the previous file and updates the preview
