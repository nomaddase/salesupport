# Push Notification System

Push notifications are handled by the backend using `pywebpush` and Celery tasks. Register browser subscriptions via the `/push/register` endpoint and trigger deliveries via `/push/send`. VAPID credentials must be configured in the backend environment.
