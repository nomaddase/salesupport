from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.crm import Client, Interaction, Invoice, Reminder
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> dict:
    clients_query = db.query(Client).filter(Client.manager_id == current_user.id)
    total_clients = clients_query.count()

    interactions_query = (
        db.query(Interaction)
        .join(Client)
        .filter(Client.manager_id == current_user.id)
    )
    total_interactions = interactions_query.count()

    reminders_query = (
        db.query(Reminder)
        .join(Client)
        .filter(Client.manager_id == current_user.id, Reminder.status == "pending")
    )
    pending_reminders = reminders_query.count()

    revenue = (
        db.query(func.coalesce(func.sum(Invoice.total_sum), 0))
        .join(Client)
        .filter(Client.manager_id == current_user.id)
        .scalar()
    )

    recent_reminders = reminders_query.order_by(Reminder.remind_at.asc()).limit(5).all()
    recent_interactions = (
        interactions_query.order_by(Interaction.created_at.desc()).limit(5).all()
    )

    ai_recommendations = [
        {
            "id": reminder.id,
            "title": f"Свяжитесь с {reminder.client.name}",
            "message": reminder.reason,
        }
        for reminder in recent_reminders
        if reminder.client
    ]

    last_week = datetime.utcnow() - timedelta(days=7)
    interactions_last_week = interactions_query.filter(Interaction.created_at >= last_week).count()

    trends = {
        "clients": f"+{total_clients} всего",
        "interactions": f"{interactions_last_week} за 7 дней",
        "reminders": f"{pending_reminders} активных",
        "revenue": f"{float(revenue or 0):,.0f} ₽"
    }

    return {
        "totals": {
            "clients": total_clients,
            "interactions": total_interactions,
            "reminders": pending_reminders,
            "revenue": float(revenue or 0),
        },
        "trends": trends,
        "aiRecommendations": ai_recommendations,
        "recentInteractions": [
            {
                "id": interaction.id,
                "client": interaction.client.name if interaction.client else None,
                "type": interaction.type,
                "result": interaction.result,
                "created_at": interaction.created_at,
            }
            for interaction in recent_interactions
        ],
    }
