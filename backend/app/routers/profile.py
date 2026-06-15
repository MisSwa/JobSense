from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.user import User
from app.schemas.preferences import Preferences
from app.utils.resume_parser import extract_text_from_pdf, extract_text_from_docx

router = APIRouter()

# Keyed by file extension — more reliable than content_type which browsers/curl may misreport
ALLOWED_EXTENSIONS = {
    ".pdf": extract_text_from_pdf,
    ".docx": extract_text_from_docx,
}


async def _get_user(db: AsyncSession) -> User:
    result = await db.execute(select(User).where(User.id == 1))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=500, detail="User record not found.")
    return user


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

    user = await _get_user(db)
    user.resume_text = resume_text
    user.resume_file_path = str(upload_path)
    await db.commit()

    return {"resume_text": resume_text}


@router.get("/profile/preferences", response_model=Preferences, response_model_exclude_none=True)
async def get_preferences(db: AsyncSession = Depends(get_db)):
    user = await _get_user(db)
    if not user.preferences:
        return Preferences()
    return Preferences(**user.preferences)


@router.put("/profile/preferences", response_model=Preferences, response_model_exclude_none=True)
async def put_preferences(
    body: Preferences,
    db: AsyncSession = Depends(get_db),
):
    user = await _get_user(db)
    existing = user.preferences or {}
    merged = {**existing, **body.model_dump(exclude_none=True)}
    user.preferences = merged
    await db.commit()
    return Preferences(**merged)
