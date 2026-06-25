from typing import Annotated

from fastapi import Depends, Header
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.core.security import decode_access_token
from app.database.session import get_db
from app.models.user import User
from app.repositories.user_repository import get_user

bearer = HTTPBearer(auto_error=False)


def get_current_user(
    db: Annotated[Session, Depends(get_db)],
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)] = None,
    x_user_id: Annotated[int | None, Header(alias="X-User-Id")] = None,
) -> User:
    user_id: int | None = x_user_id
    if credentials:
        payload = decode_access_token(credentials.credentials)
        user_id = int(payload["sub"])
    if not user_id:
        raise AppError("Login required", 401)
    user = get_user(db, user_id)
    if not user:
        raise AppError("User not found", 404)
    return user
