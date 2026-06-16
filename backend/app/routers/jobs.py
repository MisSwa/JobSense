from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.job import Job, JobStatus, EmploymentType, ConflictLevel
from app.schemas.job import JobCreate, JobOut, JobStatusUpdate

router = APIRouter()


@router.get("/jobs", response_model=list[JobOut])
async def list_jobs(
    status: Optional[JobStatus] = Query(default=None),
    employment_type: Optional[EmploymentType] = Query(default=None),
    conflict_level: Optional[ConflictLevel] = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Job)
    if status is not None:
        stmt = stmt.where(Job.status == status)
    if employment_type is not None:
        stmt = stmt.where(Job.employment_type == employment_type)
    if conflict_level is not None:
        stmt = stmt.where(Job.conflict_level == conflict_level)
    stmt = stmt.order_by(Job.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/jobs/{job_id}", response_model=JobOut)
async def get_job(job_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found.")
    return job


@router.put("/jobs/{job_id}/status", response_model=JobOut)
async def update_job_status(job_id: int, body: JobStatusUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found.")
    job.status = body.status
    await db.commit()
    await db.refresh(job)
    return job


@router.delete("/jobs/{job_id}", status_code=204)
async def delete_job(job_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found.")
    await db.delete(job)
    await db.commit()
    return Response(status_code=204)


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
