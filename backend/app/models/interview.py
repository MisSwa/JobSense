import enum
from sqlalchemy import Integer, Text, DateTime, ForeignKey, func, Enum as SAEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class InterviewOutcome(str, enum.Enum):
    passed = "passed"
    failed = "failed"
    pending = "pending"


class Interview(Base):
    __tablename__ = "interviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    job_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False
    )
    interview_date: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    interview_type: Mapped[str | None] = mapped_column(Text, nullable=True)
    interviewer_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    scorecard: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    outcome: Mapped[InterviewOutcome] = mapped_column(
        SAEnum(InterviewOutcome, name="interview_outcome"),
        nullable=False,
        default=InterviewOutcome.pending,
        server_default=InterviewOutcome.pending.value,
    )
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
