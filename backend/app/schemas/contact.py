from datetime import datetime

from pydantic import BaseModel

from app.schemas.common import ORMModel
from app.schemas.user import UserPublic


class ContactCreate(BaseModel):
    contact_id: int


class ContactPublic(ORMModel):
    id: int
    owner_id: int
    contact_id: int
    created_at: datetime
    contact: UserPublic
