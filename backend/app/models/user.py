from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import Column, DateTime, Enum, Integer, String

from app.db.base_class import Base


class UserRole(str, PyEnum):
    ADMIN = "admin"
    MANAGER = "manager"
    SUPERVISOR = "supervisor"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    role = Column(Enum(UserRole, native_enum=False), nullable=False, default=UserRole.MANAGER)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
