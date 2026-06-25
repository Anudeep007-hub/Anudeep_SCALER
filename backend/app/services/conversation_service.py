from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.repositories import conversation_repository, user_repository
from app.utils.enums import ConversationType


def create_direct_chat(db: Session, current_user_id: int, other_user_id: int):
    if current_user_id == other_user_id:
        raise AppError("Cannot create a direct chat with yourself")
    if not user_repository.get_user(db, other_user_id):
        raise AppError("User not found", 404)
    existing = conversation_repository.find_direct_between(db, current_user_id, other_user_id)
    if existing:
        return existing
    return conversation_repository.create_conversation(
        db,
        type_=ConversationType.DIRECT,
        created_by=current_user_id,
        participant_ids=[current_user_id, other_user_id],
    )


def list_conversations(db: Session, current_user_id: int, *, q: str | None = None, limit: int = 50, offset: int = 0):
    return conversation_repository.list_for_user(db, current_user_id, q=q, limit=limit, offset=offset)


def get_conversation(db: Session, current_user_id: int, conversation_id: int):
    conversation = conversation_repository.get_conversation(db, conversation_id)
    if not conversation or not conversation_repository.is_participant(db, conversation_id, current_user_id):
        raise AppError("Conversation not found", 404)
    return conversation
