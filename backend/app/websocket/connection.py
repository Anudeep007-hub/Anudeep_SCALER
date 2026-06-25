from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.utils.helpers import conversation_room, user_room
from app.websocket.events import event
from app.websocket.manager import manager

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/conversations/{conversation_id}")
async def conversation_socket(websocket: WebSocket, conversation_id: int):
    room = conversation_room(conversation_id)
    await manager.connect(room, websocket)
    try:
        while True:
            payload = await websocket.receive_json()
            if payload.get("type") == "typing":
                await manager.broadcast(
                    room,
                    event(
                        "typing",
                        conversation_id=conversation_id,
                        user_id=payload.get("user_id"),
                        state=payload.get("state", "started"),
                    ),
                )
    except WebSocketDisconnect:
        manager.disconnect(room, websocket)


@router.websocket("/ws/users/{user_id}")
async def user_socket(websocket: WebSocket, user_id: int):
    room = user_room(user_id)
    await manager.connect(room, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(room, websocket)
