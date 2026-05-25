from app.database.db import Base, engine

# Import all models here so tables are registered
from app.models import rtc_model  # important

def init_db():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database initialized successfully ✅")


if __name__ == "__main__":
    init_db()