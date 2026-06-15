from typing import Optional
from pydantic import BaseModel, ConfigDict


class Restrictions(BaseModel):
    model_config = ConfigDict(extra="forbid")

    current_client: Optional[str] = None
    current_vendor: Optional[str] = None
    restricted_clients: Optional[list[str]] = None
    restricted_vendors: Optional[list[str]] = None
    noncompete_industries: Optional[list[str]] = None
    noncompete_locations: Optional[list[str]] = None
    contract_end_date: Optional[str] = None
