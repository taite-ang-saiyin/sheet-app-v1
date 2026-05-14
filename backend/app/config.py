from functools import lru_cache
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    supabase_url: Optional[str] = Field(default=None, alias="SUPABASE_URL")
    supabase_service_role_key: Optional[str] = Field(
        default=None, alias="SUPABASE_SERVICE_ROLE_KEY"
    )
    supabase_anon_key: Optional[str] = Field(default=None, alias="SUPABASE_ANON_KEY")
    frontend_origin: str = Field(default="http://localhost:5173", alias="FRONTEND_ORIGIN")
    port: int = Field(default=8000, alias="PORT")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def supabase_configured(self) -> bool:
        return bool(self.supabase_url and self.supabase_service_role_key)

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.frontend_origin.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
