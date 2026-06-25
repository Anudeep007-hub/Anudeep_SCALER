from fastapi import UploadFile

from app.repositories import upload_repository
from app.schemas.upload import UploadPublic


async def save_upload(file: UploadFile) -> UploadPublic:
    url, filename = await upload_repository.save_upload(file)
    return UploadPublic(url=url, filename=filename, content_type=file.content_type)
