from functools import lru_cache
from pathlib import Path

from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "Signal Clone Backend"
    debug: bool = True
    database_url: str = f"sqlite:///{Path(__file__).resolve().parents[1] / 'database' / 'database.db'}"
    secret_key: str = "mock-signal-secret-change-in-production"
    algorithm: str = "HS256"
    cors_origins: list[str] = ["*"]


@lru_cache
def get_settings() -> Settings:
    return Settings()
