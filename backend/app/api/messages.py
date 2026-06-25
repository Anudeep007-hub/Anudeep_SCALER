from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.message import MessageCreate, MessagePublic, ReactionCreate, ReactionPublic
from app.services import message_service
from app.utils.responses import ok

router = APIRouter(tags=["messages"])


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessagePublic])
def list_messages(
    conversation_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    limit: int = Query(default=50, ge=1, le=100),
    before_id: int | None = Query(default=None),
):
    return message_service.list_messages(db, current_user.id, conversation_id, limit=limit, before_id=before_id)


@router.post("/conversations/{conversation_id}/messages", response_model=MessagePublic)
async def send_message(
    conversation_id: int,
    data: MessageCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await message_service.send_message(db, current_user.id, conversation_id, data)


@router.post("/conversations/{conversation_id}/read", response_model=list[MessagePublic])
async def mark_read(
    conversation_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await message_service.mark_read(db, current_user.id, conversation_id)


@router.post("/messages/{message_id}/reactions", response_model=ReactionPublic)
async def react(
    message_id: int,
    data: ReactionCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await message_service.react(db, current_user.id, message_id, data.emoji)


@router.delete("/messages/{message_id}/reactions")
async def remove_reaction(
    message_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    await message_service.remove_reaction(db, current_user.id, message_id)
    return ok(message="Reaction removed")
