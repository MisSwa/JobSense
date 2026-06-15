import enum
from typing import Optional
from pydantic import BaseModel, ConfigDict


class EmploymentTypeEnum(str, enum.Enum):
    fte = "fte"
    contract = "contract"
    contract_to_hire = "contract_to_hire"
    part_time = "part_time"


class RemoteEnum(str, enum.Enum):
    remote = "remote"
    hybrid = "hybrid"
    onsite = "onsite"


class Preferences(BaseModel):
    model_config = ConfigDict(extra="forbid")

    target_titles: Optional[list[str]] = None
    employment_types: Optional[list[EmploymentTypeEnum]] = None
    remote_preference: Optional[RemoteEnum] = None
    target_locations: Optional[list[str]] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    target_industries: Optional[list[str]] = None
    target_skills: Optional[list[str]] = None
