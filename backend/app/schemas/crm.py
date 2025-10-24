from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr


class ClientBase(BaseModel):
    name: str
    phone: str
    email: EmailStr
    status: str
    priority: str
    total_sum: float


class ClientCreate(ClientBase):
    manager_id: Optional[int] = None


class ClientUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    total_sum: Optional[float] = None


class ClientRead(ClientBase):
    id: int
    manager_id: int
    created_at: datetime

    class Config:
        orm_mode = True


class InteractionBase(BaseModel):
    client_id: int
    type: str
    result: str


class InteractionCreate(InteractionBase):
    pass


class InteractionRead(InteractionBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class ReminderBase(BaseModel):
    client_id: int
    remind_at: datetime
    reason: str
    auto_generated: bool = False


class ReminderCreate(ReminderBase):
    pass


class ReminderRead(ReminderBase):
    id: int

    class Config:
        orm_mode = True


class FunnelBase(BaseModel):
    name: str
    stages: List[str]


class FunnelCreate(FunnelBase):
    pass


class FunnelRead(FunnelBase):
    id: int

    class Config:
        orm_mode = True


class SalesScriptBase(BaseModel):
    stage: str
    script_text: str
    efficiency: float
    usage_count: int


class SalesScriptRead(SalesScriptBase):
    id: int

    class Config:
        orm_mode = True


class InvoiceBase(BaseModel):
    client_id: int
    file_path: str
    total_sum: float
    parsed_data: dict | None = None


class InvoiceRead(InvoiceBase):
    id: int

    class Config:
        orm_mode = True


class ClientProgressBase(BaseModel):
    client_id: int
    funnel_id: int
    stage: str


class ClientProgressRead(ClientProgressBase):
    id: int
    updated_at: datetime

    class Config:
        orm_mode = True


class AuditLogRead(BaseModel):
    id: int
    user_id: int
    action: str
    entity: str
    entity_id: int
    timestamp: datetime

    class Config:
        orm_mode = True
