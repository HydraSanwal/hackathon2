from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    qdrant_url: str
    qdrant_api_key: str
    neon_database_url: str
    gemini_api_key: str
    secret_key: str

    class Config:
        env_file = ".env"

settings = Settings()