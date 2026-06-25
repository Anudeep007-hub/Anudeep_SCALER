from app.core.constants import MOCK_OTP
from app.core.exceptions import AppError


def require_mock_otp(otp: str) -> None:
    if otp != MOCK_OTP:
        raise AppError("Invalid OTP", 401)
