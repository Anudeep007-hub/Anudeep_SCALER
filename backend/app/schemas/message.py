from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel
from app.schemas.user import UserPublic
from app.utils.enums import MessageStatus, MessageType


class MessageCreate(BaseModel):
    content: str = Field(default="", max_length=5000)
    attachment_url: str | None = None
    message_type: MessageType = MessageType.TEXT
    reply_to: int | None = None
    expires_in_seconds: int | None = Field(default=None, ge=1, le=60 * 60 * 24 * 7)


class ReactionCreate(BaseModel):
    emoji: str = Field(min_length=1, max_length=24)


class ReactionPublic(ORMModel):
    id: int
    message_id: int
    user_id: int
    emoji: str


class ReceiptPublic(ORMModel):
    id: int
    message_id: int
    user_id: int
    delivered_at: datetime | None = None
    read_at: datetime | None = None


class MessagePublic(ORMModel):
    id: int
    conversation_id: int
    sender_id: int
    reply_to: int | None = None
    content: str
    attachment_url: str | None = None
    message_type: MessageType
    status: MessageStatus
    expires_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    sender: UserPublic | None = None
    reactions: list[ReactionPublic] = []
    receipts: list[ReceiptPublic] = []
