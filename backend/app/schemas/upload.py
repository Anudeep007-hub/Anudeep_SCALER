from pydantic import BaseModel


class UploadPublic(BaseModel):
    url: str
    filename: str
    content_type: str | None = None
