from typing import Any, Literal

from pydantic import BaseModel


class SocketEvent(BaseModel):
    type: str
    payload: dict[str, Any]


def event(type_: str, **payload: Any) -> dict[str, Any]:
    return SocketEvent(type=type_, payload=payload).model_dump()


TypingState = Literal["started", "stopped"]
