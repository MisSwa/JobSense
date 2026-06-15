from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.user import User
from app.utils.resume_parser import extract_text_from_pdf, extract_text_from_docx

router = APIRouter()

# Keyed by file extension — more reliable than content_type which browsers/curl may misreport
ALLOWED_EXTENSIONS = {
    ".pdf": extract_text_from_pdf,
    ".docx": extract_text_from_docx,
}


@router.get("/profile")
async def get_profile(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == 1))
    user = result.scalar_one_or_none()
    if user is None:
        return {"resume_text": None, "resume_file_path": None}
    return {"resume_text": user.resume_text, "resume_file_path": user.resume_file_path}


@router.post("/profile/resume")
async def upload_resume(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    ext = Path(file.filename or "").suffix.lower()
    extractor = ALLOWED_EXTENSIONS.get(ext)
    if extractor is None:
        raise HTTPException(
            status_code=422,
            detail="Unsupported file type. Upload a PDF or DOCX.",
        )

    upload_path = Path("uploads") / f"resume{ext}"

    contents = await file.read()
    upload_path.write_bytes(contents)

    try:
        resume_text = extractor(upload_path)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to extract text: {e}")

    result = await db.execute(select(User).where(User.id == 1))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=500, detail="User record not found.")

    user.resume_text = resume_text
    user.resume_file_path = str(upload_path)
    await db.commit()

    return {"resume_text": resume_text}
