from fastapi import APIRouter

from app.config import settings
from app.schemas.status_schema import StatusResponse

router = APIRouter(prefix="/api", tags=["status"])


@router.get("/status", response_model=StatusResponse)
def get_status() -> StatusResponse:
    return StatusResponse(
        backendStatus="online",
        databaseStatus="not_connected",
        version=settings.app_version,
        environment=settings.environment,
        lastPriceUpdate=None,
        lastImportStatus="not_started",
    )