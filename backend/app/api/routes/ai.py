from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.models.user import User
from app.services.ai import get_ai_engine

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/recommend")
async def recommend(payload: dict, current_user: User = Depends(get_current_user)):
    engine = get_ai_engine()
    recommendation = await engine.generate_next_step(payload)
    reminder = await engine.schedule_reminder(payload)
    return {"recommendation": recommendation, "reminder": reminder}
