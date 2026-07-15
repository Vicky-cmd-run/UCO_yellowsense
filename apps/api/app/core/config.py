# import os
# from dotenv import load_dotenv

# load_dotenv()

# class Settings:
#     PROJECT_NAME: str = "YellowSense Customer 360"
#     VERSION: str = "1.0.0"
#     API_V1_STR: str = "/api/v1"
    
#     DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./yellowsense.db")
#     SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-for-poc-use-only")
#     ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
#     ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
#     GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY", None)

# settings = Settings()
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parents[4]  # repo root, not apps/api

class Settings:
    PROJECT_NAME: str = "YellowSense Customer 360"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'yellowsense.db'}")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-for-poc-use-only")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY", None)

settings = Settings()