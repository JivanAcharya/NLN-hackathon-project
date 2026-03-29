import os
from dotenv import load_dotenv
# from pydantic_settings import BaseSettings

class Settings:
    def __init__(self):
        load_dotenv()

        self.database_url = os.getenv("DATABASE_URL")
        self.hashing_algorithm = os.getenv("HASHING_ALGORITHM")
        self.secret_key = os.getenv("SECRET_KEY")
        self.allowed_origins: list = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",") if o.strip()]

        self.access_token_expire_time: int  = 60
        self.refresh_token_expire_time: int = 60 * 24 * 7

        self.PROJECT_NAME:str = "Mental Health"

#instatiate the class
settings = Settings()
