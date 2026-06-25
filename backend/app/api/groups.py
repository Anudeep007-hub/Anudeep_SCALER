from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.conversation import ConversationPublic
from app.schemas.group import GroupCreate, GroupMemberUpdate, GroupRename
from app.services import group_service

router = APIRouter(prefix="/groups", tags=["groups"])


@router.post("", response_model=ConversationPublic)
def create_group(
    data: GroupCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return group_service.create_group(db, current_user.id, name=data.name, member_ids=data.member_ids, avatar_url=data.avatar_url)


@router.patch("/{conversation_id}", response_model=ConversationPublic)
def rename_group(
    conversation_id: int,
    data: GroupRename,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return group_service.rename_group(db, current_user.id, conversation_id, data.name)


@router.post("/{conversation_id}/members", response_model=ConversationPublic)
def add_member(
    conversation_id: int,
    data: GroupMemberUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return group_service.add_member(db, current_user.id, conversation_id, data.user_id)


@router.delete("/{conversation_id}/members/{user_id}", response_model=ConversationPublic)
def remove_member(
    conversation_id: int,
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return group_service.remove_member(db, current_user.id, conversation_id, user_id)
