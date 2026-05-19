from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    environment: str = "development"
    debug: bool = True
    secret_key: str = "dev-only-change-me"
    database_url: str = (
        "postgresql+asyncpg://tazarzit:tazarzit@localhost:5432/tazarzitbio"
    )
    cors_origins: str = "http://localhost:3000"
    api_prefix: str = "/api/v1"
    log_level: str = "INFO"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
