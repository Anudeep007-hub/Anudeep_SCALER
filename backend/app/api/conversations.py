from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.conversation import ConversationPublic, DirectConversationCreate
from app.services import conversation_service

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("", response_model=list[ConversationPublic])
def list_conversations(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    q: str | None = Query(default=None, max_length=80),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    return conversation_service.list_conversations(db, current_user.id, q=q, limit=limit, offset=offset)


@router.post("/direct", response_model=ConversationPublic)
def create_direct_chat(
    data: DirectConversationCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return conversation_service.create_direct_chat(db, current_user.id, data.user_id)


@router.get("/{conversation_id}", response_model=ConversationPublic)
def get_conversation(
    conversation_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return conversation_service.get_conversation(db, current_user.id, conversation_id)
