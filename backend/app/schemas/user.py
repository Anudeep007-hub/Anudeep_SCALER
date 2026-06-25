from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class UserBase(BaseModel):
    phone: str = Field(min_length=3, max_length=32)
    username: str | None = Field(default=None, max_length=64)
    display_name: str = Field(min_length=1, max_length=120)
    avatar_url: str | None = None
    bio: str | None = Field(default=None, max_length=240)


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    username: str | None = Field(default=None, max_length=64)
    display_name: str | None = Field(default=None, min_length=1, max_length=120)
    avatar_url: str | None = None
    bio: str | None = Field(default=None, max_length=240)
    is_online: bool | None = None


class UserPublic(ORMModel):
    id: int
    phone: str
    username: str | None = None
    display_name: str
    avatar_url: str | None = None
    bio: str | None = None
    is_online: bool
    last_seen: datetime | None = None
    created_at: datetime
    updated_at: datetime
