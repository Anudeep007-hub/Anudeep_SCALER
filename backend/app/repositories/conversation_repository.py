from sqlalchemy import desc, exists, select
from sqlalchemy.orm import Session, selectinload

from app.models.conversation import Conversation
from app.models.participant import Participant
from app.utils.enums import ConversationType, ParticipantRole


def get_conversation(db: Session, conversation_id: int) -> Conversation | None:
    stmt = (
        select(Conversation)
        .options(
            selectinload(Conversation.participants).selectinload(Participant.user),
            selectinload(Conversation.last_message),
        )
        .where(Conversation.id == conversation_id)
    )
    return db.scalar(stmt)


def is_participant(db: Session, conversation_id: int, user_id: int) -> bool:
    return db.scalar(
        select(exists().where(Participant.conversation_id == conversation_id, Participant.user_id == user_id))
    )


def get_participant(db: Session, conversation_id: int, user_id: int) -> Participant | None:
    return db.scalar(select(Participant).where(Participant.conversation_id == conversation_id, Participant.user_id == user_id))


def find_direct_between(db: Session, user_a: int, user_b: int) -> Conversation | None:
    direct_ids = (
        select(Participant.conversation_id)
        .join(Conversation, Conversation.id == Participant.conversation_id)
        .where(Conversation.type == ConversationType.DIRECT.value, Participant.user_id.in_([user_a, user_b]))
        .group_by(Participant.conversation_id)
        .having(Participant.conversation_id.is_not(None))
    )
    for conversation_id in db.scalars(direct_ids):
        users = set(db.scalars(select(Participant.user_id).where(Participant.conversation_id == conversation_id)))
        if users == {user_a, user_b}:
            return get_conversation(db, conversation_id)
    return None


def create_conversation(
    db: Session,
    *,
    type_: ConversationType,
    created_by: int,
    participant_ids: list[int],
    name: str | None = None,
    avatar_url: str | None = None,
    admin_ids: set[int] | None = None,
) -> Conversation:
    conversation = Conversation(type=type_.value, name=name, avatar_url=avatar_url, created_by=created_by)
    db.add(conversation)
    db.flush()
    admins = admin_ids or {created_by}
    unique_ids = list(dict.fromkeys(participant_ids))
    for user_id in unique_ids:
        db.add(
            Participant(
                conversation_id=conversation.id,
                user_id=user_id,
                role=ParticipantRole.ADMIN.value if user_id in admins else ParticipantRole.MEMBER.value,
            )
        )
    db.commit()
    return get_conversation(db, conversation.id)  # type: ignore[return-value]


def list_for_user(db: Session, user_id: int, *, q: str | None = None, limit: int = 50, offset: int = 0) -> list[Conversation]:
    stmt = (
        select(Conversation)
        .join(Participant, Participant.conversation_id == Conversation.id)
        .options(
            selectinload(Conversation.participants).selectinload(Participant.user),
            selectinload(Conversation.last_message),
        )
        .where(Participant.user_id == user_id)
        .order_by(desc(Conversation.updated_at))
        .limit(limit)
        .offset(offset)
    )
    conversations = list(db.scalars(stmt).unique())
    if q:
        needle = q.lower()
        conversations = [
            c
            for c in conversations
            if (c.name and needle in c.name.lower())
            or any(needle in p.user.display_name.lower() or (p.user.username and needle in p.user.username.lower()) for p in c.participants)
        ]
    return conversations


def touch_last_message(db: Session, conversation: Conversation, message_id: int) -> Conversation:
    conversation.last_message_id = message_id
    db.commit()
    db.refresh(conversation)
    return conversation
