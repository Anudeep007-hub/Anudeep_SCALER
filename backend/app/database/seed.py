from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.message import Message
from app.models.user import User
from app.repositories import conversation_repository, message_repository
from app.utils.enums import ConversationType, MessageType


def seed_database(db: Session) -> None:
    if db.scalar(select(User).limit(1)):
        return

    users = [
        User(phone="+15550000001", username="maya", display_name="Maya Chen", avatar_url="https://i.pravatar.cc/120?img=1"),
        User(phone="+15550000002", username="arjun", display_name="Arjun Rao", avatar_url="https://i.pravatar.cc/120?img=2"),
        User(phone="+15550000003", username="sofia", display_name="Sofia Reyes", avatar_url="https://i.pravatar.cc/120?img=3"),
        User(phone="+15550000004", username="leo", display_name="Leo Martin", avatar_url="https://i.pravatar.cc/120?img=4"),
    ]
    db.add_all(users)
    db.commit()
    for user in users:
        db.refresh(user)

    direct = conversation_repository.create_conversation(
        db,
        type_=ConversationType.DIRECT,
        created_by=users[0].id,
        participant_ids=[users[0].id, users[1].id],
    )
    group = conversation_repository.create_conversation(
        db,
        type_=ConversationType.GROUP,
        created_by=users[0].id,
        participant_ids=[user.id for user in users],
        name="Signal Project",
        admin_ids={users[0].id},
    )

    samples = [
        (direct.id, users[0].id, "Hey Arjun, the backend skeleton is ready."),
        (direct.id, users[1].id, "Nice. I will wire the UI against the seeded chat."),
        (group.id, users[2].id, "Group messages, reactions, replies, and uploads are all on the checklist."),
        (group.id, users[3].id, "Perfect. Keeping auth mocked will save time."),
    ]
    for conversation_id, sender_id, content in samples:
        message = message_repository.create_message(
            db,
            conversation_id=conversation_id,
            sender_id=sender_id,
            content=content,
            attachment_url=None,
            message_type=MessageType.TEXT,
            reply_to=None,
            expires_at=None,
        )
        conversation = conversation_repository.get_conversation(db, conversation_id)
        if conversation:
            conversation_repository.touch_last_message(db, conversation, message.id)

    # Keep the import visible to model scanners and interview walkthroughs.
    assert Message
