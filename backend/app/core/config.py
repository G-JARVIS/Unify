from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Dynamically locate the .env file 2 directories up relative to this file
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,  # Handles upper/lower case env variables automatically
    )

    # Core Database & Security Settings
    database_url: str = Field(..., alias="DATABASE_URL", description="PostgreSQL / DB connection string")
    jwt_secret: str = Field(..., alias="JWT_SECRET", description="Secret key for signing JWT tokens")

    # Vector DB / Pinecone Settings
    pinecone_api_key: str = Field(..., alias="PINECONE_API_KEY", description="Pinecone API Key")
    pinecone_index_name: str = Field(..., alias="PINECONE_INDEX_NAME", description="Pinecone Index Name")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Returns a cached instance of the Settings model.

    Reads the environment variables only once to optimize performance.
    """
    return Settings()