from datetime import datetime, timedelta
from typing import Any, Dict, List

import re

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

    async def suggest_message(self, payload: dict[str, Any]) -> Dict[str, Any]:
        text: str = payload.get("text", "")
        client_name = payload.get("client_name") or "клиента"
        stage = payload.get("stage", "в работе")
        history: List[dict[str, Any]] = payload.get("history", [])
        last_interaction = history[-1]["content"] if history else ""

        acknowledgement = ""
        if last_interaction:
            acknowledgement = f" Учтите последнее сообщение: «{last_interaction[:80]}»."

        suggestion = (
            f"Предлагаю ответить {client_name} с благодарностью за обращение, подтвердить детали запроса"
            f" и предложить следующий шаг на стадии {stage}." + acknowledgement
        )

        return {
            "suggestion": suggestion,
            "context": "AI учёл историю переписки и текущий этап сделки.",
            "actions": [
                {"value": "add-reminder", "label": "Создать напоминание", "variant": "primary"},
                {"value": "attach-invoice", "label": "Приложить счёт"},
            ],
        }

    async def generate_reminder_text(self, context: dict[str, Any]) -> Dict[str, Any]:
        priority = context.get("priority", "medium")
        client_name = context.get("client_name", "клиент")
        base = datetime.utcnow()
        hours = 6 if priority == "high" else 24
        due_at = base + timedelta(hours=hours)
        return {
            "text": f"Связаться с {client_name} и уточнить статус предложения.",
            "due_at": due_at,
        }

    async def generate_idle_prompt(self, clients: List[dict[str, Any]]) -> Dict[str, Any]:
        if not clients:
            return {"prompt": "Нет клиентов, требующих внимания."}

        names = ", ".join(client.get("name", "клиент") for client in clients[:3])
        return {
            "prompt": f"Рекомендуем связаться с: {names}. Давно не было активности.",
            "client_ids": [client["id"] for client in clients if "id" in client],
        }

    async def parse_invoice(self, invoice_text: str | None) -> Dict[str, Any]:
        if not invoice_text:
            return {"total": 0.0, "items": [], "context": "Не удалось распознать содержимое счёта."}

        lines = [line.strip() for line in invoice_text.splitlines() if line.strip()]
        number_pattern = re.compile(r"(?<!\d)(\d+[\d\s]*(?:[\.,]\d{1,2})?)")
        totals: List[float] = []
        items: List[dict[str, Any]] = []

        for line in lines:
            matches = number_pattern.findall(line)
            if not matches:
                continue
            values = []
            for match in matches:
                normalized = match.replace(" ", "").replace(",", ".")
                try:
                    values.append(float(normalized))
                except ValueError:
                    continue
            if not values:
                continue
            totals.extend(values)
            if len(values) >= 2:
                items.append({
                    "description": line[:80],
                    "quantity": values[0],
                    "price": values[1],
                })

        total_sum = totals[-1] if totals else 0.0
        return {
            "total": round(total_sum, 2),
            "items": items[:10],
            "context": "Извлечены числовые значения из счёта и рассчитана примерная сумма.",
        }


def get_ai_engine() -> AIEngine:
    return AIEngine()
