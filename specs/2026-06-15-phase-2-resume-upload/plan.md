# Phase 2 — Resume Upload: Plan

**Approach:** Vertical slice

---

## Group 1 — Dependencies & Seed User

1. Add dependencies: `uv add pdfplumber python-docx python-multipart`
2. Create `backend/uploads/` directory; add it to `.gitignore` (keep the dir, ignore its contents)
3. Update the lifespan handler in `main.py`:
   - Create `uploads/` directory if it doesn't exist (`Path("uploads").mkdir(exist_ok=True)`)
   - Insert `User(id=1)` if it doesn't already exist (use `INSERT ... ON CONFLICT DO NOTHING` or a select-then-insert pattern)

---

## Group 2 — Extraction Utility & Endpoint

4. Create `backend/app/utils/__init__.py` and `backend/app/utils/resume_parser.py`:
   - `extract_text_from_pdf(path: Path) -> str` — opens with `pdfplumber`, joins all page text
   - `extract_text_from_docx(path: Path) -> str` — opens with `python-docx`, joins all paragraph text
5. Create `backend/app/routers/profile.py`:
   - `GET /api/profile` — query `User` where `id=1`, return `resume_text` and `resume_file_path`
   - `POST /api/profile/resume`:
     - Validate content type / extension; raise `HTTPException(422)` for unsupported formats
     - Save file to `uploads/resume.<ext>`
     - Call the appropriate extraction function
     - Update `users` row `id=1` with `resume_text` and `resume_file_path`
     - Return `{ "resume_text": "<text>" }`
6. Register `profile` router in `main.py` with prefix `/api`
7. Manual test: `curl -F "file=@/path/to/resume.pdf" http://localhost:8000/api/profile/resume`

---

## Group 3 — Frontend Profile Page

8. Create `frontend/src/hooks/useProfile.js`:
   - `GET /api/profile` on mount; returns `{ resumeText, loading, error }`
9. Update `frontend/src/pages/Profile.jsx`:
   - On mount: fetch and display existing `resume_text` if present
   - File input (`accept=".pdf,.docx"`) + "Upload Resume" button
   - `POST /api/profile/resume` with `FormData` on submit
   - Loading state: button disabled + "Uploading..."
   - Success: update displayed text in place
   - Error: show inline message below the form
   - Text preview: scrollable panel with extracted text, labelled "Extracted resume text"

---

## Group 4 — Integration Smoke Test

10. Upload a real PDF via the UI — confirm text appears in the preview panel
11. Upload a real DOCX via the UI — confirm text appears
12. Upload a `.txt` file — confirm error message appears in the UI (not a blank screen)
13. Query the DB directly: `SELECT resume_text IS NOT NULL FROM users WHERE id=1` → true
14. Re-upload a different PDF — confirm text preview updates and the old file is replaced
