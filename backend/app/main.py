from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def get_health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/status")
def get_status() -> dict[str, str | None]:
    return {
        "backendStatus": "online",
        "databaseStatus": "not_connected",
        "version": settings.app_version,
        "environment": settings.environment,
        "lastPriceUpdate": None,
        "lastImportStatus": "not_started",
    }