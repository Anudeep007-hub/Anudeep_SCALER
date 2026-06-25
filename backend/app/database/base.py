from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


def import_models() -> None:
    from app.models import contact  # noqa: F401
    from app.models import conversation  # noqa: F401
    from app.models import message  # noqa: F401
    from app.models import participant  # noqa: F401
    from app.models import reaction  # noqa: F401
    from app.models import receipt  # noqa: F401
    from app.models import user  # noqa: F401
