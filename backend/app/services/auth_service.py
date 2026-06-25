from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.core.security import create_access_token
from app.repositories import auth_repository, user_repository
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest
from app.schemas.user import UserPublic
from app.utils.helpers import normalize_phone, utc_now
from app.utils.validators import require_mock_otp


def _auth_response(user) -> AuthResponse:
    token = create_access_token(str(user.id), {"phone": user.phone})
    return AuthResponse(access_token=token, user=UserPublic.model_validate(user))


def register(db: Session, data: RegisterRequest) -> AuthResponse:
    require_mock_otp(data.otp)
    phone = normalize_phone(data.phone)
    existing = auth_repository.find_identity(db, phone=phone, username=data.username)
    if existing:
        existing.display_name = data.display_name
        existing.avatar_url = data.avatar_url or existing.avatar_url
        existing.is_online = True
        db.commit()
        db.refresh(existing)
        return _auth_response(existing)
    user = auth_repository.create_identity(
        db,
        phone=phone,
        username=data.username,
        display_name=data.display_name,
        avatar_url=data.avatar_url,
    )
    user.is_online = True
    db.commit()
    db.refresh(user)
    return _auth_response(user)


def login(db: Session, data: LoginRequest) -> AuthResponse:
    require_mock_otp(data.otp)
    user = auth_repository.find_identity(
        db,
        phone=normalize_phone(data.phone) if data.phone else None,
        username=data.username,
    )
    if not user:
        raise AppError("User not found", 404)
    user.is_online = True
    db.commit()
    db.refresh(user)
    return _auth_response(user)


def logout(db: Session, user_id: int) -> None:
    user = user_repository.get_user(db, user_id)
    if user:
        user.is_online = False
        user.last_seen = utc_now()
        db.commit()
