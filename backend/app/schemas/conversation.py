from datetime import datetime

from pydantic import BaseModel

from app.schemas.common import ORMModel
from app.schemas.message import MessagePublic
from app.schemas.user import UserPublic
from app.utils.enums import ConversationType, ParticipantRole


class DirectConversationCreate(BaseModel):
    user_id: int


class ParticipantPublic(ORMModel):
    id: int
    conversation_id: int
    user_id: int
    role: ParticipantRole
    joined_at: datetime
    user: UserPublic


class ConversationPublic(ORMModel):
    id: int
    type: ConversationType
    name: str | None = None
    avatar_url: str | None = None
    created_by: int | None = None
    last_message_id: int | None = None
    created_at: datetime
    updated_at: datetime
    participants: list[ParticipantPublic] = []
    last_message: MessagePublic | None = None
    unread_count: int = 0
