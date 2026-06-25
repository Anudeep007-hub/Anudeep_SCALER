from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest
from app.schemas.user import UserPublic
from app.services import auth_service
from app.utils.responses import ok

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse)
def register(data: RegisterRequest, db: Annotated[Session, Depends(get_db)]) -> AuthResponse:
    return auth_service.register(db, data)


@router.post("/login", response_model=AuthResponse)
def login(data: LoginRequest, db: Annotated[Session, Depends(get_db)]) -> AuthResponse:
    return auth_service.login(db, data)


@router.post("/logout")
def logout(db: Annotated[Session, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]):
    auth_service.logout(db, current_user.id)
    return ok(message="Logged out")


@router.get("/me", response_model=UserPublic)
def me(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    return current_user
