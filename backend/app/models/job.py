import enum
from sqlalchemy import Integer, Text, DateTime, Numeric, func, Enum as SAEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class JobStatus(str, enum.Enum):
    discovered = "discovered"
    applied = "applied"
    screening = "screening"
    interview = "interview"
    offer = "offer"
    rejected = "rejected"
    withdrawn = "withdrawn"


class EmploymentType(str, enum.Enum):
    fte = "fte"
    contract = "contract"
    contract_to_hire = "contract_to_hire"
    part_time = "part_time"


class ConflictLevel(str, enum.Enum):
    green = "green"
    yellow = "yellow"
    red = "red"


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str | None] = mapped_column(Text, nullable=True)
    company: Mapped[str | None] = mapped_column(Text, nullable=True)
    vendor: Mapped[str | None] = mapped_column(Text, nullable=True)
    client: Mapped[str | None] = mapped_column(Text, nullable=True)
    salary_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    salary_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    tech_stack: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    location: Mapped[str | None] = mapped_column(Text, nullable=True)
    employment_type: Mapped[EmploymentType | None] = mapped_column(
        SAEnum(EmploymentType, name="employment_type"), nullable=True
    )
    status: Mapped[JobStatus] = mapped_column(
        SAEnum(JobStatus, name="job_status"),
        nullable=False,
        default=JobStatus.discovered,
        server_default=JobStatus.discovered.value,
    )
    fit_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    fit_explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    conflict_level: Mapped[ConflictLevel | None] = mapped_column(
        SAEnum(ConflictLevel, name="conflict_level"), nullable=True
    )
    conflict_reasons: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    source: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    dedup_hash: Mapped[str | None] = mapped_column(Text, nullable=True, index=True)
    recruiter_info: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    raw_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
