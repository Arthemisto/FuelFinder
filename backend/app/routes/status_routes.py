from fastapi import APIRouter

from app.config import settings

router = APIRouter(prefix="/api", tags=["status"])


@router.get("/status")
def get_status() -> dict[str, str | None]:
    return {
        "backendStatus": "online",
        "databaseStatus": "not_connected",
        "version": settings.app_version,
        "environment": settings.environment,
        "lastPriceUpdate": None,
        "lastImportStatus": "not_started",
    }