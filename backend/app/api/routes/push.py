from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user
from app.models.user import User
from app.workers.celery_app import send_push_task

router = APIRouter(prefix="/push", tags=["push"])

subscriptions: dict[int, list[dict]] = {}


@router.post("/register", status_code=status.HTTP_204_NO_CONTENT)
def register(subscription: dict, current_user: User = Depends(get_current_user)) -> None:
    user_subscriptions = subscriptions.setdefault(current_user.id, [])
    user_subscriptions.append(subscription)


@router.post("/send", status_code=status.HTTP_202_ACCEPTED)
def send(payload: dict, current_user: User = Depends(get_current_user)) -> dict:
    user_subscriptions = subscriptions.get(current_user.id)
    if not user_subscriptions:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No subscriptions found")
    for subscription in user_subscriptions:
        send_push_task.delay(subscription, payload.get("message", ""))
    return {"scheduled": len(user_subscriptions)}
