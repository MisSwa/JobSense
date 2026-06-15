from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.job import Job, JobStatus
from app.schemas.job import JobCreate, JobOut

router = APIRouter()


@router.post("/jobs", response_model=JobOut, status_code=201)
async def create_job(body: JobCreate, db: AsyncSession = Depends(get_db)):
    recruiter_info = {
        k: v for k, v in {
            "name": body.recruiter_name,
            "email": body.recruiter_email,
            "phone": body.recruiter_phone,
        }.items() if v is not None
    } or None

    job = Job(
        title=body.title,
        company=body.company,
        vendor=body.vendor,
        client=body.client,
        salary_min=body.salary_min,
        salary_max=body.salary_max,
        tech_stack=body.tech_stack,
        location=body.location,
        employment_type=body.employment_type,
        status=JobStatus.discovered,
        source="manual",
        source_url=body.source_url,
        recruiter_info=recruiter_info,
        raw_text=body.raw_text,
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return job
