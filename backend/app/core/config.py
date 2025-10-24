from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    app_name: str = "AI-driven Web CRM Platform"
    api_v1_prefix: str = "/api"

    database_url: str = Field(
        "postgresql+psycopg2://postgres:postgres@db:5432/salesupport",
        env="DATABASE_URL",
    )
    redis_url: str = Field("redis://redis:6379/0", env="REDIS_URL")

    jwt_secret_key: str = Field("super-secret", env="JWT_SECRET_KEY")
    jwt_algorithm: str = Field("HS256", env="JWT_ALGORITHM")
    jwt_access_token_expire_minutes: int = Field(60, env="JWT_ACCESS_EXPIRE")

    cors_origins: List[str] = Field(default_factory=lambda: ["*"])

    openai_api_key: str = Field("", env="OPENAI_API_KEY")
    openai_model: str = Field("gpt-4o", env="OPENAI_MODEL")
    openai_temperature: float = Field(0.3, env="OPENAI_TEMPERATURE")

    vapid_public_key: str = Field("", env="VAPID_PUBLIC_KEY")
    vapid_private_key: str = Field("", env="VAPID_PRIVATE_KEY")
    vapid_email: str = Field("mailto:admin@example.com", env="VAPID_EMAIL")

    retention_days: int = Field(90, env="RETENTION_DAYS")

    class Config:
        env_file = Path(__file__).resolve().parent.parent.parent / ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
