# Phase 2 — Resume Upload: Requirements

**Phase:** 2
**Date:** 2026-06-15
**Branch:** `phase-2-resume-upload`
**Depends on:** Phase 1 (DB connection, User model, get_db dependency)

---

## Scope

Add resume upload to the Profile page. The uploaded file is saved to disk and its text is extracted and stored in the DB. The frontend shows the extracted text immediately after upload.

---

## Backend Deliverables

### Dependencies
- `pdfplumber` — PDF text extraction (handles multi-column layouts better than PyPDF2)
- `python-docx` — DOCX text extraction
- `python-multipart` — required by FastAPI for `UploadFile` support

### File storage
- Uploaded files saved to `backend/uploads/` (created at startup if missing)
- Filename: `resume.pdf` or `resume.docx` — always overwritten on re-upload (single user, no versioning)
- Path stored in `users.resume_file_path`

### Seed user
- The app is single-user. A `User` row with `id=1` must exist before any profile endpoint can be called.
- On startup (in the lifespan handler), insert `id=1` if it does not already exist.

### Endpoint: `POST /api/profile/resume`
- Accepts `multipart/form-data` with a single file field named `file`
- Allowed content types / extensions: `application/pdf` (`.pdf`) and `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (`.docx`)
- Any other format returns `422 { "error": "Unsupported file type. Upload a PDF or DOCX." }`
- Extraction:
  - PDF: join all page text via `pdfplumber`
  - DOCX: join all paragraph text via `python-docx`
- Saves file to `uploads/resume.<ext>`
- Updates `users` row `id=1`: sets `resume_text` and `resume_file_path`
- Returns `200 { "resume_text": "<extracted text>" }`

### Endpoint: `GET /api/profile`
- Returns the current user row: `{ "resume_text": "...", "resume_file_path": "..." }`
- Returns `{ "resume_text": null, "resume_file_path": null }` if no resume has been uploaded yet
- Used by the frontend on page load to pre-populate the text preview

---

## Frontend Deliverables

### Profile page (`src/pages/Profile.jsx`)
- On mount: calls `GET /api/profile` and renders existing `resume_text` if present
- Upload form:
  - File input (accept `.pdf,.docx`)
  - "Upload Resume" submit button
  - While uploading: button disabled, shows "Uploading..."
  - On success: updates the text preview panel in place
  - On error: shows inline error message below the form
- Text preview panel:
  - Shown when `resume_text` is non-null
  - Scrollable `<pre>` or `<div>` with the extracted text
  - Label: "Extracted resume text"

---

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| File persistence | Save to disk + store text in DB | Allows re-extraction later if parsing logic improves |
| File location | `backend/uploads/` | Simple local path; configurable via Filesystem MCP in Phase 19 |
| Versioning | Always overwrite | Single-user tool; no need for resume history in early phases |
| Seed user | Insert id=1 on startup | Avoids requiring a separate user-creation step before any profile call |
| Unsupported format response | 422 | FastAPI validation error convention; gives the frontend a clear error shape |

---

## Out of Scope
- Multiple resume versions
- Resume parsing beyond plain text extraction (structured fields from resume come in Phase 11 via intake_node)
- Authentication / user selection
- Any profile fields beyond `resume_text` and `resume_file_path` (preferences and restrictions are Phase 3 and 4)
