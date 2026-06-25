from typing import Annotated

from fastapi import APIRouter, Depends, File, UploadFile

from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.upload import UploadPublic
from app.services import upload_service

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post("", response_model=UploadPublic)
async def upload_file(_: Annotated[User, Depends(get_current_user)], file: UploadFile = File(...)):
    return await upload_service.save_upload(file)
