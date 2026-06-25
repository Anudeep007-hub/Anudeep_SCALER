from collections import defaultdict

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.active: dict[str, set[WebSocket]] = defaultdict(set)

    async def connect(self, room: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active[room].add(websocket)

    def disconnect(self, room: str, websocket: WebSocket) -> None:
        sockets = self.active.get(room)
        if not sockets:
            return
        sockets.discard(websocket)
        if not sockets:
            self.active.pop(room, None)

    async def broadcast(self, room: str, message: dict) -> None:
        stale: list[WebSocket] = []
        for websocket in list(self.active.get(room, set())):
            try:
                await websocket.send_json(message)
            except RuntimeError:
                stale.append(websocket)
        for websocket in stale:
            self.disconnect(room, websocket)


manager = ConnectionManager()
