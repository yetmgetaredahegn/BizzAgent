"""Runtime settings, read from BIZZAGENT_* environment variables."""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="BIZZAGENT_", env_file=".env", extra="ignore")

    env: str = "dev"
    frontend_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    media_dir: Path = BACKEND_DIR / "var" / "media"

    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.frontend_origins.split(",") if o.strip()]


settings = Settings()
