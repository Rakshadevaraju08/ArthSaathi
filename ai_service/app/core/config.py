import os

class Settings:
    PROJECT_NAME = "ArthSaathi AI Service"
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

settings = Settings()