"""Compatibility package exposing the FastAPI app module from ``backend/app``."""
from __future__ import annotations

from pathlib import Path

__all__ = ["main"]

_backend_app_path = Path(__file__).resolve().parent.parent / "backend" / "app"
__path__ = [str(_backend_app_path)]
