from datetime import datetime

from sqlalchemy import delete, select
from sqlalchemy.orm import Session, selectinload

from app.models.message import Message
from app.models.participant import Participant
from app.models.reaction import Reaction
from app.models.receipt import MessageReceipt
from app.utils.enums import MessageStatus, MessageType
from app.utils.helpers import utc_now


def get_message(db: Session, message_id: int) -> Message | None:
    stmt = (
        select(Message)
        .options(
            selectinload(Message.sender),
            selectinload(Message.reactions),
            selectinload(Message.receipts),
        )
        .where(Message.id == message_id)
    )
    return db.scalar(stmt)


def list_messages(db: Session, conversation_id: int, *, limit: int = 50, before_id: int | None = None) -> list[Message]:
    stmt = (
        select(Message)
        .options(
            selectinload(Message.sender),
            selectinload(Message.reactions),
            selectinload(Message.receipts),
        )
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc(), Message.id.desc())
        .limit(limit)
    )
    if before_id:
        stmt = stmt.where(Message.id < before_id)
    return list(reversed(list(db.scalars(stmt).unique())))


def create_message(
    db: Session,
    *,
    conversation_id: int,
    sender_id: int,
    content: str,
    attachment_url: str | None,
    message_type: MessageType,
    reply_to: int | None,
    expires_at: datetime | None,
) -> Message:
    message = Message(
        conversation_id=conversation_id,
        sender_id=sender_id,
        content=content,
        attachment_url=attachment_url,
        message_type=message_type.value,
        status=MessageStatus.SENT.value,
        reply_to=reply_to,
        expires_at=expires_at,
    )
    db.add(message)
    db.flush()
    participant_ids = list(db.scalars(select(Participant.user_id).where(Participant.conversation_id == conversation_id)))
    now = utc_now()
    for user_id in participant_ids:
        db.add(
            MessageReceipt(
                message_id=message.id,
                user_id=user_id,
                delivered_at=now if user_id != sender_id else now,
                read_at=now if user_id == sender_id else None,
            )
        )
    db.commit()
    return get_message(db, message.id)  # type: ignore[return-value]


def mark_read(db: Session, *, conversation_id: int, user_id: int) -> list[Message]:
    now = utc_now()
    receipts = list(
        db.scalars(
            select(MessageReceipt)
            .join(Message, Message.id == MessageReceipt.message_id)
            .where(
                Message.conversation_id == conversation_id,
                MessageReceipt.user_id == user_id,
                MessageReceipt.read_at.is_(None),
            )
        )
    )
    for receipt in receipts:
        receipt.delivered_at = receipt.delivered_at or now
        receipt.read_at = now
    messages = list(
        db.scalars(
            select(Message)
            .where(Message.conversation_id == conversation_id, Message.sender_id != user_id)
        )
    )
    for message in messages:
        message.status = MessageStatus.READ.value
    db.commit()
    return list_messages(db, conversation_id)


def add_reaction(db: Session, *, message_id: int, user_id: int, emoji: str) -> Reaction:
    reaction = db.scalar(select(Reaction).where(Reaction.message_id == message_id, Reaction.user_id == user_id))
    if reaction:
        reaction.emoji = emoji
    else:
        reaction = Reaction(message_id=message_id, user_id=user_id, emoji=emoji)
        db.add(reaction)
    db.commit()
    db.refresh(reaction)
    return reaction


def remove_reaction(db: Session, *, message_id: int, user_id: int) -> int:
    result = db.execute(delete(Reaction).where(Reaction.message_id == message_id, Reaction.user_id == user_id))
    db.commit()
    return result.rowcount or 0


def delete_expired(db: Session) -> int:
    result = db.execute(delete(Message).where(Message.expires_at.is_not(None), Message.expires_at <= utc_now()))
    db.commit()
    return result.rowcount or 0
