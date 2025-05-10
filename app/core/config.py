from typing import List
import os
from pydantic_settings import BaseSettings
import secrets

class Settings(BaseSettings):
    # Configuración básica
    APP_NAME: str = "Mental Health Traffic Light"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    
    # Tiempo de expiración del token JWT (30 días)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/mental_health")
    
    # OpenAI
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Configuración de usuarios
    FIRST_SUPERUSER_EMAIL: str = os.getenv("FIRST_SUPERUSER_EMAIL", "admin@example.com")
    FIRST_SUPERUSER_PASSWORD: str = os.getenv("FIRST_SUPERUSER_PASSWORD", "admin123")
    
    class Config:
        env_file = ".env"

settings = Settings() 