import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PostPulse - AI Social Media Scheduler"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Auth
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-postpulse-jwt-key-2026-change-in-prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Database
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "postpulse_db")
    
    # AI Engine
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Meta Graph API (Facebook & Instagram)
    META_APP_ID: str = os.getenv("META_APP_ID", "mock_app_id")
    META_APP_SECRET: str = os.getenv("META_APP_SECRET", "mock_app_secret")
    META_API_VERSION: str = os.getenv("META_API_VERSION", "v19.0")
    
    # Meta Sandbox / Mock Engine mode (True by default for easy testing without real token app approval)
    USE_MOCK_META: bool = os.getenv("USE_MOCK_META", "true").lower() in ("true", "1", "yes")

    class Config:
        case_sensitive = True

settings = Settings()
