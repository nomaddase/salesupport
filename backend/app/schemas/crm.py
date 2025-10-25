from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, ConfigDict


class ClientBase(BaseModel):
    name: str
    phone: str
    email: EmailStr
    city: str | None = None
    demand: str | None = None
    status: str = "new"
    priority: str = "medium"
    total_sum: float = 0.0


class ClientCreate(ClientBase):
    manager_id: Optional[int] = None


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    city: Optional[str] = None
    demand: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    total_sum: Optional[float] = None


class ClientRead(ClientBase):
    id: int
    manager_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InteractionBase(BaseModel):
    client_id: int
    type: str
    result: str


class InteractionCreate(InteractionBase):
    pass


class InteractionRead(InteractionBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReminderBase(BaseModel):
    client_id: int
    remind_at: datetime
    reason: str
    status: str = "pending"
    auto_generated: bool = False


class ReminderCreate(ReminderBase):
    pass


class ReminderRead(ReminderBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class FunnelBase(BaseModel):
    name: str
    stages: List[str]


class FunnelCreate(FunnelBase):
    pass


class FunnelRead(FunnelBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class SalesScriptBase(BaseModel):
    stage: str
    script_text: str
    efficiency: float
    usage_count: int


class SalesScriptRead(SalesScriptBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class InvoiceBase(BaseModel):
    client_id: int
    file_path: str
    total_sum: float
    parsed_data: dict | None = None


class InvoiceRead(InvoiceBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class ClientProgressBase(BaseModel):
    client_id: int
    funnel_id: int
    stage: str


class ClientProgressRead(ClientProgressBase):
    id: int
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AuditLogRead(BaseModel):
    id: int
    user_id: int
    action: str
    entity: str
    entity_id: int
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
