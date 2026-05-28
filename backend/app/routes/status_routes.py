from fastapi import APIRouter

from app.config import settings
from app.database import check_database_connection
from app.schemas.status_schema import StatusResponse

router = APIRouter(prefix="/api", tags=["status"])


@router.get("/status", response_model=StatusResponse)
def get_status() -> StatusResponse:
    database_status = (
        "connected" if check_database_connection() else "not_connected"
    )

    return StatusResponse(
        backendStatus="online",
        databaseStatus=database_status,
        version=settings.app_version,
        environment=settings.environment,
        lastPriceUpdate=None,
        lastImportStatus="not_started",
    )