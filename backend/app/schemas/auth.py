from datetime import datetime

from typing import List, Optional

from pydantic import BaseModel, EmailStr

from app.models.user import UserRole


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    message: str


class TokenPayload(BaseModel):
    sub: str
    exp: int


class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: UserRole = UserRole.MANAGER


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    password: Optional[str] = None


class UserRead(UserBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class UserResponse(BaseModel):
    user: UserRead
    message: str


class UserListResponse(BaseModel):
    items: List[UserRead]
    message: str
