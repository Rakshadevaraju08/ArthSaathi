from fastapi import FastAPI
from app.routes.rtc_routes import router as rtc_router

app = FastAPI()

@app.get("/")
def home():
    return {"message": "AI Service Running"}

app.include_router(rtc_router)