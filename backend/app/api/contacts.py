from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.contact import ContactCreate, ContactPublic
from app.services import contact_service
from app.utils.responses import ok

router = APIRouter(prefix="/contacts", tags=["contacts"])


@router.get("", response_model=list[ContactPublic])
def list_contacts(db: Annotated[Session, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]):
    return contact_service.list_contacts(db, current_user.id)


@router.post("", response_model=ContactPublic)
def add_contact(
    data: ContactCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return contact_service.add_contact(db, current_user.id, data.contact_id)


@router.delete("/{contact_id}")
def remove_contact(
    contact_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    contact_service.remove_contact(db, current_user.id, contact_id)
    return ok(message="Contact removed")
