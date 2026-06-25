from datetime import datetime, timezone


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def normalize_phone(phone: str) -> str:
    return "".join(ch for ch in phone.strip() if ch.isdigit() or ch == "+")


def conversation_room(conversation_id: int) -> str:
    return f"conversation:{conversation_id}"


def user_room(user_id: int) -> str:
    return f"user:{user_id}"
