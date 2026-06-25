from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.conversation import Conversation
from app.models.participant import Participant
from app.utils.enums import ConversationType, ParticipantRole


def rename_group(db: Session, conversation: Conversation, name: str) -> Conversation:
    conversation.name = name
    db.commit()
    db.refresh(conversation)
    return conversation


def add_member(db: Session, conversation_id: int, user_id: int) -> Participant:
    existing = db.scalar(
        select(Participant).where(Participant.conversation_id == conversation_id, Participant.user_id == user_id)
    )
    if existing:
        return existing
    participant = Participant(conversation_id=conversation_id, user_id=user_id, role=ParticipantRole.MEMBER.value)
    db.add(participant)
    db.commit()
    db.refresh(participant)
    return participant


def remove_member(db: Session, conversation_id: int, user_id: int) -> int:
    result = db.execute(delete(Participant).where(Participant.conversation_id == conversation_id, Participant.user_id == user_id))
    db.commit()
    return result.rowcount or 0


def is_group(conversation: Conversation) -> bool:
    return conversation.type == ConversationType.GROUP.value
