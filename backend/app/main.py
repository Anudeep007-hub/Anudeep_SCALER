from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.api import auth, contacts, conversations, groups, messages, settings, uploads, users
from app.core.config import get_settings
from app.core.constants import API_PREFIX
from app.core.exceptions import register_exception_handlers
from app.core.middleware import register_middleware
from app.database.base import Base, import_models
from app.database.seed import seed_database
from app.database.session import SessionLocal, engine
from app.websocket import connection


def create_app() -> FastAPI:
    app_settings = get_settings()
    app = FastAPI(title=app_settings.app_name, debug=app_settings.debug)
    register_middleware(app)
    register_exception_handlers(app)

    app.include_router(auth.router, prefix=API_PREFIX)
    app.include_router(users.router, prefix=API_PREFIX)
    app.include_router(contacts.router, prefix=API_PREFIX)
    app.include_router(conversations.router, prefix=API_PREFIX)
    app.include_router(messages.router, prefix=API_PREFIX)
    app.include_router(groups.router, prefix=API_PREFIX)
    app.include_router(uploads.router, prefix=API_PREFIX)
    app.include_router(settings.router, prefix=API_PREFIX)
    app.include_router(connection.router)

    upload_path = Path(__file__).resolve().parent / "uploads"
    upload_path.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=upload_path), name="uploads")

    @app.on_event("startup")
    def startup() -> None:
        import_models()
        Base.metadata.create_all(bind=engine)
        with SessionLocal() as db:
            seed_database(db)

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
