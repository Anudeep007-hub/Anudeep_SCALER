from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories import user_repository


def find_identity(db: Session, *, phone: str | None = None, username: str | None = None) -> User | None:
    return user_repository.get_by_phone_or_username(db, phone, username)


def create_identity(
    db: Session,
    *,
    phone: str,
    username: str | None,
    display_name: str,
    avatar_url: str | None = None,
) -> User:
    return user_repository.create_user(
        db,
        phone=phone,
        username=username,
        display_name=display_name,
        avatar_url=avatar_url,
    )
