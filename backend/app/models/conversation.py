from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.utils.enums import ConversationType


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[str] = mapped_column(String(16), default=ConversationType.DIRECT.value, index=True)
    name: Mapped[str | None] = mapped_column(String(140), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    created_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    last_message_id: Mapped[int | None] = mapped_column(ForeignKey("messages.id", use_alter=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), index=True)

    creator = relationship("User", foreign_keys=[created_by])
    participants = relationship("Participant", back_populates="conversation", cascade="all, delete-orphan")
    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        foreign_keys="Message.conversation_id",
    )
    last_message = relationship("Message", foreign_keys=[last_message_id], post_update=True)
