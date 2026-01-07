import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "A.V.E.A Backend"
    API_V1_STR: str = "/api"
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    FIREBASE_CREDENTIALS_PATH: str = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase-adminsdk.json")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    BACKEND_PORT: int = 8080
    
    GOOGLE_CLOUD_PROJECT: str = os.getenv("GOOGLE_CLOUD_PROJECT", "video-editing-git-918280-158e1")
    STORAGE_BUCKET: str = os.getenv("STORAGE_BUCKET", "")

    # File Paths
    UPLOAD_DIR: str = os.path.join(os.getcwd(), "temp_uploads")
    OUTPUT_DIR: str = os.path.join(os.getcwd(), "downloads")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Ensure dirs exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.OUTPUT_DIR, exist_ok=True)
