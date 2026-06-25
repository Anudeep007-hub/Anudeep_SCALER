from sqlalchemy import delete, select
from sqlalchemy.orm import Session, selectinload

from app.models.contact import Contact


def add_contact(db: Session, owner_id: int, contact_id: int) -> Contact:
    existing = db.scalar(
        select(Contact).where(Contact.owner_id == owner_id, Contact.contact_id == contact_id)
    )
    if existing:
        return existing
    contact = Contact(owner_id=owner_id, contact_id=contact_id)
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


def list_contacts(db: Session, owner_id: int) -> list[Contact]:
    stmt = (
        select(Contact)
        .options(selectinload(Contact.contact))
        .where(Contact.owner_id == owner_id)
        .order_by(Contact.created_at.desc())
    )
    return list(db.scalars(stmt))


def remove_contact(db: Session, owner_id: int, contact_id: int) -> int:
    result = db.execute(delete(Contact).where(Contact.owner_id == owner_id, Contact.contact_id == contact_id))
    db.commit()
    return result.rowcount or 0
