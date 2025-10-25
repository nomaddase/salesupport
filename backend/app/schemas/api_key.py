from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class ApiKeyBase(BaseModel):
    name: str
    service: str


class ApiKeyCreate(ApiKeyBase):
    key_value: str


class ApiKeyUpdate(BaseModel):
    name: Optional[str] = None
    service: Optional[str] = None
    key_value: Optional[str] = None


class ApiKeyRead(ApiKeyBase):
    id: int
    key_value: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApiKeyResponse(BaseModel):
    api_key: ApiKeyRead
    message: str


class ApiKeyListResponse(BaseModel):
    items: List[ApiKeyRead]
    message: str

