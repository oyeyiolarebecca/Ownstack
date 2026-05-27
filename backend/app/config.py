"""Runtime configuration loaded from environment / .env."""
from __future__ import annotations

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str

    # Bitnob (HMAC-SHA256 signed requests; see docs.bitnob.com/docs/authentication)
    BITNOB_BASE_URL: str = "https://sandboxapi.bitnob.co"
    BITNOB_CLIENT_ID: str = ""
    BITNOB_SECRET: str = ""
    BITNOB_API_KEY: str = ""  # legacy; kept for backwards compat with old .env files
    BITNOB_WEBHOOK_SECRET: str = ""

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

    # Demo controls
    DEMO_MODE: bool = True
    NGN_PER_SAT_FALLBACK: float = 1.5

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
