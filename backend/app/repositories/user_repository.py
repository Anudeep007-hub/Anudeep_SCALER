from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.user import User


def create_user(db: Session, *, phone: str, username: str | None, display_name: str, avatar_url: str | None = None) -> User:
    user = User(phone=phone, username=username, display_name=display_name, avatar_url=avatar_url)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def get_by_phone(db: Session, phone: str) -> User | None:
    return db.scalar(select(User).where(User.phone == phone))


def get_by_username(db: Session, username: str) -> User | None:
    return db.scalar(select(User).where(User.username == username))


def get_by_phone_or_username(db: Session, phone: str | None, username: str | None) -> User | None:
    filters = []
    if phone:
        filters.append(User.phone == phone)
    if username:
        filters.append(User.username == username)
    if not filters:
        return None
    return db.scalar(select(User).where(or_(*filters)))


def search_users(db: Session, q: str, *, limit: int = 20, exclude_user_id: int | None = None) -> list[User]:
    pattern = f"%{q.strip()}%"
    stmt = select(User).where(
        or_(
            User.display_name.ilike(pattern),
            User.username.ilike(pattern),
            User.phone.ilike(pattern),
        )
    )
    if exclude_user_id:
        stmt = stmt.where(User.id != exclude_user_id)
    return list(db.scalars(stmt.order_by(User.display_name).limit(limit)))


def update_user(db: Session, user: User, **data: object) -> User:
    for key, value in data.items():
        if value is not None:
            setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user
