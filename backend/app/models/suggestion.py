import enum
from sqlalchemy import Integer, Text, Boolean, DateTime, ForeignKey, func, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class SuggestionType(str, enum.Enum):
    skill_gap = "skill_gap"
    resume_keyword = "resume_keyword"
    interview_prep = "interview_prep"
    career_advice = "career_advice"


class Suggestion(Base):
    __tablename__ = "suggestions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    job_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True
    )
    type: Mapped[SuggestionType] = mapped_column(
        SAEnum(SuggestionType, name="suggestion_type"), nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
