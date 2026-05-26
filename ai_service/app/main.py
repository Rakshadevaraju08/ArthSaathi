from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.constants import settings
from app.routes.ai_analysis_routes import router as ai_analysis_router


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="AI analysis service for signup-based occupation financial profiling.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai_analysis_router, prefix=settings.API_PREFIX)


@app.get("/")
def root():
    return {
        "service": settings.APP_NAME,
        "status": "running",
        "docs": "/docs",
        "health": f"{settings.API_PREFIX}/ai-analysis/health",
    }