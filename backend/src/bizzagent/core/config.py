"""Runtime settings, read from BIZZAGENT_* environment variables."""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="BIZZAGENT_", env_file=".env", extra="ignore")

    env: str = "dev"
    frontend_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    media_dir: Path = BACKEND_DIR / "var" / "media"
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/bizzagent"
    jwt_secret: str = "dev-insecure-jwt-secret-do-not-use-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # 7 days

    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.frontend_origins.split(",") if o.strip()]


settings = Settings()
