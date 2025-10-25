from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.ai import (
    IdlePromptRequest,
    IdlePromptResponse,
    InvoiceParseRequest,
    InvoiceParseResponse,
    ReminderTextRequest,
    ReminderTextResponse,
    SuggestMessageRequest,
    SuggestMessageResponse,
)
from app.services.ai import get_ai_engine

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/recommend")
async def recommend(payload: dict, current_user: User = Depends(get_current_user)):
    engine = get_ai_engine()
    recommendation = await engine.generate_next_step(payload)
    reminder = await engine.schedule_reminder(payload)
    return {"recommendation": recommendation, "reminder": reminder}


@router.post("/suggest_message", response_model=SuggestMessageResponse)
async def suggest_message(
    request: SuggestMessageRequest, current_user: User = Depends(get_current_user)
):
    engine = get_ai_engine()
    result = await engine.suggest_message(request.model_dump())
    return SuggestMessageResponse(**result)


@router.post("/reminder_text", response_model=ReminderTextResponse)
async def reminder_text(
    request: ReminderTextRequest, current_user: User = Depends(get_current_user)
):
    engine = get_ai_engine()
    result = await engine.generate_reminder_text(request.model_dump())
    return ReminderTextResponse(**result)


@router.post("/invoice/parse", response_model=InvoiceParseResponse)
async def parse_invoice(
    request: InvoiceParseRequest, current_user: User = Depends(get_current_user)
):
    engine = get_ai_engine()
    result = await engine.parse_invoice(request.content)
    return InvoiceParseResponse(**result)


@router.post("/idle_prompt", response_model=IdlePromptResponse)
async def idle_prompt(
    request: IdlePromptRequest, current_user: User = Depends(get_current_user)
):
    engine = get_ai_engine()
    result = await engine.generate_idle_prompt(request.clients)
    return IdlePromptResponse(**result)
