from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

from app.models.job import EmploymentType, JobStatus, ConflictLevel


class JobCreate(BaseModel):
    title: str
    company: Optional[str] = None
    vendor: Optional[str] = None
    client: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    tech_stack: Optional[list[str]] = None
    location: Optional[str] = None
    employment_type: Optional[EmploymentType] = None
    source_url: Optional[str] = None
    recruiter_name: Optional[str] = None
    recruiter_email: Optional[str] = None
    recruiter_phone: Optional[str] = None
    raw_text: Optional[str] = None


class JobStatusUpdate(BaseModel):
    status: JobStatus


class JobOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: Optional[str]
    company: Optional[str]
    vendor: Optional[str]
    client: Optional[str]
    salary_min: Optional[int]
    salary_max: Optional[int]
    tech_stack: Optional[list]
    location: Optional[str]
    employment_type: Optional[EmploymentType]
    status: JobStatus
    fit_score: Optional[int]
    fit_explanation: Optional[str]
    conflict_level: Optional[ConflictLevel]
    conflict_reasons: Optional[list]
    source: Optional[str]
    source_url: Optional[str]
    dedup_hash: Optional[str]
    recruiter_info: Optional[dict]
    raw_text: Optional[str]
    created_at: datetime
    updated_at: datetime
