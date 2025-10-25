from functools import lru_cache
from pathlib import Path
from typing import List, Tuple

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI-driven Web CRM Platform"
    api_v1_prefix: str = "/api"

    database_url: str = Field(
        "sqlite:///./salesupport.db",
        env="DATABASE_URL",
    )
    redis_url: str = Field("redis://redis:6379/0", env="REDIS_URL")

    jwt_secret_key: str = Field("super-secret", env="JWT_SECRET_KEY")
    jwt_algorithm: str = Field("HS256", env="JWT_ALGORITHM")
    jwt_access_token_expire_minutes: int = Field(60, env="JWT_ACCESS_EXPIRE")

    cors_origins: List[str] = Field(default_factory=lambda: ["*"], env="CORS_ORIGINS")

    openai_api_key: str = Field("", env="OPENAI_API_KEY")
    openai_model: str = Field("gpt-4o", env="OPENAI_MODEL")
    openai_temperature: float = Field(0.3, env="OPENAI_TEMPERATURE")

    vapid_public_key: str = Field("", env="VAPID_PUBLIC_KEY")
    vapid_private_key: str = Field("", env="VAPID_PRIVATE_KEY")
    vapid_email: str = Field("mailto:admin@example.com", env="VAPID_EMAIL")

    retention_days: int = Field(90, env="RETENTION_DAYS")

    default_locale: str = Field("ru", env="DEFAULT_LOCALE")
    locale_directory: str = Field(
        default=str(Path(__file__).resolve().parent.parent / "locales"),
        env="LOCALE_DIR",
    )
    api_key_encryption_secret: str = Field("change-me", env="API_KEY_STORAGE_ENCRYPTION")
    default_admin_credentials: str = Field(
        "admin:878707Server", env="DEFAULT_ADMIN_CREDENTIALS"
    )

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parent.parent.parent / ".env",
        env_file_encoding="utf-8",
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: List[str] | str) -> List[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @field_validator("default_admin_credentials")
    @classmethod
    def validate_admin_credentials(cls, value: str) -> str:
        if ":" not in value:
            raise ValueError("DEFAULT_ADMIN_CREDENTIALS must be in the format 'username:password'")
        return value

    def get_default_admin(self) -> Tuple[str, str]:
        username, password = self.default_admin_credentials.split(":", 1)
        return username.strip(), password.strip()


@lru_cache()
def get_settings() -> Settings:
    return Settings()
