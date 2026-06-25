from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.repositories import contact_repository, user_repository


def add_contact(db: Session, owner_id: int, contact_id: int):
    if owner_id == contact_id:
        raise AppError("You cannot add yourself as a contact")
    if not user_repository.get_user(db, contact_id):
        raise AppError("Contact user not found", 404)
    return contact_repository.add_contact(db, owner_id, contact_id)


def remove_contact(db: Session, owner_id: int, contact_id: int) -> None:
    contact_repository.remove_contact(db, owner_id, contact_id)


def list_contacts(db: Session, owner_id: int):
    return contact_repository.list_contacts(db, owner_id)
