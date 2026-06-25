from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.exceptions import AppError
from app.database.session import get_db
from app.models.user import User
from app.repositories import user_repository
from app.schemas.user import UserPublic, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/search", response_model=list[UserPublic])
def search_users(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    q: str = Query(default="", max_length=80),
):
    return user_repository.search_users(db, q or "", exclude_user_id=current_user.id)


@router.get("/me", response_model=UserPublic)
def profile(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    return current_user


@router.patch("/me", response_model=UserPublic)
def update_profile(
    data: UserUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return user_repository.update_user(db, current_user, **data.model_dump(exclude_unset=True))


@router.get("/{user_id}", response_model=UserPublic)
def get_profile(user_id: int, db: Annotated[Session, Depends(get_db)], _: Annotated[User, Depends(get_current_user)]):
    user = user_repository.get_user(db, user_id)
    if not user:
        raise AppError("User not found", 404)
    return user
