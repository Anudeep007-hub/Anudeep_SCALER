from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.utils.enums import MessageStatus, MessageType


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    conversation_id: Mapped[int] = mapped_column(ForeignKey("conversations.id", ondelete="CASCADE"), index=True)
    sender_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    reply_to: Mapped[int | None] = mapped_column(ForeignKey("messages.id"), nullable=True)
    content: Mapped[str] = mapped_column(Text, default="")
    attachment_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    message_type: Mapped[str] = mapped_column(String(16), default=MessageType.TEXT.value)
    status: Mapped[str] = mapped_column(String(16), default=MessageStatus.SENT.value, index=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    conversation = relationship("Conversation", back_populates="messages", foreign_keys=[conversation_id])
    sender = relationship("User", back_populates="sent_messages", foreign_keys=[sender_id])
    reply = relationship("Message", remote_side=[id])
    receipts = relationship("MessageReceipt", back_populates="message", cascade="all, delete-orphan")
    reactions = relationship("Reaction", back_populates="message", cascade="all, delete-orphan")
