from celery import Celery

from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "salesupport",
    broker=settings.redis_url,
    backend=settings.redis_url,
)


@celery_app.task
def send_push_task(subscription_info: dict, payload: str) -> None:
    from app.services.push import get_push_service

    push_service = get_push_service()
    push_service.send_notification(subscription_info, payload)
