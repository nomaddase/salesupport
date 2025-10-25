from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel, Field


class MessageSnippet(BaseModel):
    sender: str
    content: str


class SuggestMessageRequest(BaseModel):
    text: str
    client_id: Optional[int] = None
    client_name: Optional[str] = None
    stage: Optional[str] = None
    history: List[MessageSnippet] = Field(default_factory=list)


class SuggestMessageResponse(BaseModel):
    suggestion: str
    context: str
    actions: List[dict[str, Any]] = Field(default_factory=list)


class ReminderTextRequest(BaseModel):
    client_id: int
    client_name: Optional[str] = None
    priority: Optional[str] = None
    history: List[MessageSnippet] = Field(default_factory=list)


class ReminderTextResponse(BaseModel):
    text: str
    due_at: datetime


class InvoiceParseRequest(BaseModel):
    client_id: int
    file_name: str
    mime_type: Optional[str] = None
    notes: Optional[str] = None
    content: Optional[str] = None


class InvoiceParseResponse(BaseModel):
    total: float
    items: List[dict[str, Any]] = Field(default_factory=list)
    context: str


class IdlePromptRequest(BaseModel):
    clients: List[dict[str, Any]] = Field(default_factory=list)


class IdlePromptResponse(BaseModel):
    prompt: str
    client_ids: List[int] = Field(default_factory=list)
