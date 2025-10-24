from typing import Any, Dict

from pywebpush import WebPushException, webpush

from app.core.config import get_settings

settings = get_settings()


class PushNotificationService:
    def __init__(self) -> None:
        self.vapid_private_key = settings.vapid_private_key
        self.vapid_public_key = settings.vapid_public_key
        self.vapid_email = settings.vapid_email

    def send_notification(self, subscription_info: Dict[str, Any], payload: str) -> None:
        if not self.vapid_private_key or not self.vapid_public_key:
            raise RuntimeError("VAPID keys are not configured")
        try:
            webpush(
                subscription_info,
                payload,
                vapid_private_key=self.vapid_private_key,
                vapid_claims={"sub": self.vapid_email},
            )
        except WebPushException as exc:
            raise RuntimeError(f"Failed to send notification: {exc}") from exc


def get_push_service() -> PushNotificationService:
    return PushNotificationService()
