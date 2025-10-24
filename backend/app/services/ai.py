from datetime import datetime, timedelta
from typing import Any, Dict

import openai

from app.core.config import get_settings

settings = get_settings()


class AIEngine:
    def __init__(self) -> None:
        if settings.openai_api_key:
            openai.api_key = settings.openai_api_key
        self.model = settings.openai_model
        self.temperature = settings.openai_temperature

    async def analyze_interaction_history(self, history: list[dict[str, Any]]) -> Dict[str, Any]:
        return {
            "sentiment": "positive" if history else "neutral",
            "engagement": "high" if len(history) > 3 else "medium",
        }

    async def generate_next_step(self, client_context: dict[str, Any]) -> Dict[str, Any]:
        stage = client_context.get("stage", "initial")
        return {
            "next_stage": stage,
            "message": f"Follow up with client in stage {stage} with a personalized message.",
        }

    async def schedule_reminder(self, context: dict[str, Any]) -> Dict[str, Any]:
        base = datetime.utcnow()
        offset_hours = 12 if context.get("priority") == "high" else 24
        return {"remind_at": (base + timedelta(hours=offset_hours)).isoformat()}

    async def parse_invoice(self, invoice_text: str) -> Dict[str, Any]:
        return {"total_sum": 0, "items": []}


def get_ai_engine() -> AIEngine:
    return AIEngine()
