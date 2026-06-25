from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.repositories import conversation_repository, group_repository, user_repository
from app.utils.enums import ConversationType, ParticipantRole


def _require_admin(db: Session, conversation_id: int, user_id: int) -> None:
    participant = conversation_repository.get_participant(db, conversation_id, user_id)
    if not participant or participant.role != ParticipantRole.ADMIN.value:
        raise AppError("Admin access required", 403)


def create_group(db: Session, current_user_id: int, *, name: str, member_ids: list[int], avatar_url: str | None = None):
    unique_members = list(dict.fromkeys([current_user_id, *member_ids]))
    for user_id in unique_members:
        if not user_repository.get_user(db, user_id):
            raise AppError(f"User {user_id} not found", 404)
    return conversation_repository.create_conversation(
        db,
        type_=ConversationType.GROUP,
        created_by=current_user_id,
        participant_ids=unique_members,
        name=name,
        avatar_url=avatar_url,
        admin_ids={current_user_id},
    )


def rename_group(db: Session, current_user_id: int, conversation_id: int, name: str):
    conversation = conversation_repository.get_conversation(db, conversation_id)
    if not conversation or not group_repository.is_group(conversation):
        raise AppError("Group not found", 404)
    _require_admin(db, conversation_id, current_user_id)
    return group_repository.rename_group(db, conversation, name)


def add_member(db: Session, current_user_id: int, conversation_id: int, user_id: int):
    conversation = conversation_repository.get_conversation(db, conversation_id)
    if not conversation or not group_repository.is_group(conversation):
        raise AppError("Group not found", 404)
    _require_admin(db, conversation_id, current_user_id)
    if not user_repository.get_user(db, user_id):
        raise AppError("User not found", 404)
    group_repository.add_member(db, conversation_id, user_id)
    return conversation_repository.get_conversation(db, conversation_id)


def remove_member(db: Session, current_user_id: int, conversation_id: int, user_id: int):
    conversation = conversation_repository.get_conversation(db, conversation_id)
    if not conversation or not group_repository.is_group(conversation):
        raise AppError("Group not found", 404)
    _require_admin(db, conversation_id, current_user_id)
    group_repository.remove_member(db, conversation_id, user_id)
    return conversation_repository.get_conversation(db, conversation_id)
