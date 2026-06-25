from pydantic import BaseModel, Field


class GroupCreate(BaseModel):
    name: str = Field(min_length=1, max_length=140)
    member_ids: list[int] = Field(default_factory=list)
    avatar_url: str | None = None


class GroupRename(BaseModel):
    name: str = Field(min_length=1, max_length=140)


class GroupMemberUpdate(BaseModel):
    user_id: int
