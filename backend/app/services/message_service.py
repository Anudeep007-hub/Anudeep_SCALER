from datetime import timedelta

from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.repositories import conversation_repository, message_repository
from app.schemas.message import MessageCreate
from app.utils.helpers import utc_now


def list_messages(db: Session, current_user_id: int, conversation_id: int, *, limit: int = 50, before_id: int | None = None):
    if not conversation_repository.is_participant(db, conversation_id, current_user_id):
        raise AppError("Conversation not found", 404)
    message_repository.delete_expired(db)
    return message_repository.list_messages(db, conversation_id, limit=limit, before_id=before_id)


async def send_message(db: Session, current_user_id: int, conversation_id: int, data: MessageCreate):
    conversation = conversation_repository.get_conversation(db, conversation_id)
    if not conversation or not conversation_repository.is_participant(db, conversation_id, current_user_id):
        raise AppError("Conversation not found", 404)
    if not data.content and not data.attachment_url:
        raise AppError("Message content or attachment is required")
    expires_at = utc_now() + timedelta(seconds=data.expires_in_seconds) if data.expires_in_seconds else None
    message = message_repository.create_message(
        db,
        conversation_id=conversation_id,
        sender_id=current_user_id,
        content=data.content,
        attachment_url=data.attachment_url,
        message_type=data.message_type,
        reply_to=data.reply_to,
        expires_at=expires_at,
    )
    conversation_repository.touch_last_message(db, conversation, message.id)
    from app.services.websocket_service import publish_conversation_event

    await publish_conversation_event(conversation_id, "message.created", message_id=message.id)
    return message


async def mark_read(db: Session, current_user_id: int, conversation_id: int):
    if not conversation_repository.is_participant(db, conversation_id, current_user_id):
        raise AppError("Conversation not found", 404)
    messages = message_repository.mark_read(db, conversation_id=conversation_id, user_id=current_user_id)
    from app.services.websocket_service import publish_conversation_event

    await publish_conversation_event(conversation_id, "message.read", reader_id=current_user_id)
    return messages


async def react(db: Session, current_user_id: int, message_id: int, emoji: str):
    message = message_repository.get_message(db, message_id)
    if not message or not conversation_repository.is_participant(db, message.conversation_id, current_user_id):
        raise AppError("Message not found", 404)
    reaction = message_repository.add_reaction(db, message_id=message_id, user_id=current_user_id, emoji=emoji)
    from app.services.websocket_service import publish_conversation_event

    await publish_conversation_event(message.conversation_id, "reaction.updated", message_id=message_id, user_id=current_user_id)
    return reaction


async def remove_reaction(db: Session, current_user_id: int, message_id: int) -> None:
    message = message_repository.get_message(db, message_id)
    if not message or not conversation_repository.is_participant(db, message.conversation_id, current_user_id):
        raise AppError("Message not found", 404)
    message_repository.remove_reaction(db, message_id=message_id, user_id=current_user_id)
    from app.services.websocket_service import publish_conversation_event

    await publish_conversation_event(message.conversation_id, "reaction.removed", message_id=message_id, user_id=current_user_id)
