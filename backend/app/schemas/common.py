from typing import Any

from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class APIResponse(BaseModel):
    ok: bool = True
    message: str = "OK"
    data: Any = None
