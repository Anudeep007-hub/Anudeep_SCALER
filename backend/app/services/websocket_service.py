from app.utils.helpers import conversation_room, user_room
from app.websocket.events import event
from app.websocket.manager import manager


async def publish_conversation_event(conversation_id: int, type_: str, **payload: object) -> None:
    await manager.broadcast(conversation_room(conversation_id), event(type_, conversation_id=conversation_id, **payload))


async def publish_user_event(user_id: int, type_: str, **payload: object) -> None:
    await manager.broadcast(user_room(user_id), event(type_, user_id=user_id, **payload))
