from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import get_password_hash, verify_password
from app.db.session import SessionLocal
from app.models.user import User, UserRole


def ensure_default_admin() -> None:
    """Create the default administrator account if it does not exist."""

    settings = get_settings()
    username, password = settings.get_default_admin()

    session: Session = SessionLocal()
    try:
        user = session.query(User).filter(User.name == username).first()
        if user:
            updated = False
            if user.role != UserRole.ADMIN:
                user.role = UserRole.ADMIN
                updated = True
            if not verify_password(password, user.password_hash):
                user.password_hash = get_password_hash(password)
                updated = True
            expected_email = (
                username if "@" in username else f"{username}@example.com"
            )
            if user.email != expected_email:
                user.email = expected_email
                updated = True
            if updated:
                session.add(user)
                session.commit()
            return

        admin = User(
            name=username,
            email=username if "@" in username else f"{username}@example.com",
            role=UserRole.ADMIN,
            password_hash=get_password_hash(password),
        )
        session.add(admin)
        session.commit()
    finally:
        session.close()

