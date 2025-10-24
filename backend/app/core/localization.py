"""Utilities for loading localized strings."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Dict

from babel import Locale

from app.core.config import get_settings


class LocalizationError(RuntimeError):
    """Raised when localization resources cannot be loaded."""


@lru_cache()
def _load_catalog(language: str | None = None) -> Dict[str, str]:
    settings = get_settings()
    lang_code = (language or settings.default_locale).strip() or settings.default_locale

    try:
        Locale.parse(lang_code)
    except (ValueError, LookupError) as exc:  # pragma: no cover - defensive branch
        raise LocalizationError(f"Unsupported locale '{lang_code}'") from exc

    locale_dir = Path(settings.locale_directory)
    file_path = locale_dir / f"{lang_code}.json"
    if not file_path.exists():
        raise LocalizationError(f"Locale file not found for '{lang_code}'")

    try:
        import json

        with file_path.open("r", encoding="utf-8") as file:
            data = json.load(file)
    except (OSError, ValueError) as exc:  # pragma: no cover - defensive branch
        raise LocalizationError(f"Failed to load locale file '{file_path}'") from exc

    if not isinstance(data, dict):
        raise LocalizationError(f"Locale file '{file_path}' must contain an object at the top level")

    # Ensure keys and values are strings
    catalog: Dict[str, str] = {}
    for key, value in data.items():
        if isinstance(key, str) and isinstance(value, str):
            catalog[key] = value
    return catalog


def translate(message_id: str, *, language: str | None = None) -> str:
    """Return the localized string for the provided message id."""

    catalog = _load_catalog(language)
    return catalog.get(message_id, message_id)


def get_locale_messages(language: str | None = None) -> Dict[str, str]:
    """Expose the loaded messages for the given language."""

    return dict(_load_catalog(language))

