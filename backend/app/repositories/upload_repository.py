from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile


async def save_upload(file: UploadFile) -> tuple[str, str]:
    upload_dir = Path(__file__).resolve().parents[1] / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    suffix = Path(file.filename or "upload.bin").suffix
    safe_name = f"{uuid4().hex}{suffix}"
    target = upload_dir / safe_name
    content = await file.read()
    target.write_bytes(content)
    return f"/uploads/{safe_name}", safe_name
