from __future__ import annotations

import logging
import time

from sqlalchemy.exc import OperationalError

from app.db.base_class import Base
from app.db.session import engine

logger = logging.getLogger(__name__)


def init_database(max_retries: int = 5, retry_interval: float = 1.0) -> None:
    """Create all database tables, retrying until the database is ready."""

    attempts = 0
    while True:
        attempts += 1
        try:
            Base.metadata.create_all(bind=engine)
            if attempts > 1:
                logger.info("Database initialised after %s attempts", attempts)
            return
        except OperationalError as exc:
            if attempts >= max_retries:
                logger.error("Database initialisation failed after %s attempts", attempts)
                raise
            logger.warning(
                "Database not ready (attempt %s/%s): %s", attempts, max_retries, exc
            )
            time.sleep(retry_interval)
