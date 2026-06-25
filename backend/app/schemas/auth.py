from pydantic import BaseModel, Field

from app.schemas.user import UserPublic


class RegisterRequest(BaseModel):
    phone: str = Field(min_length=3, max_length=32)
    username: str | None = Field(default=None, max_length=64)
    display_name: str = Field(min_length=1, max_length=120)
    avatar_url: str | None = None
    otp: str = Field(default="123456", min_length=4, max_length=8)


class LoginRequest(BaseModel):
    phone: str | None = Field(default=None, max_length=32)
    username: str | None = Field(default=None, max_length=64)
    otp: str = Field(default="123456", min_length=4, max_length=8)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic
