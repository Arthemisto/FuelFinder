from sqlalchemy.orm import Session

from app.config import settings
from app.database import check_database_connection
from app.repositories.price_record_repository import PriceRecordRepository
from app.schemas.status_schema import StatusResponse


class StatusService:
    def __init__(self, db: Session):
        self.price_record_repository = PriceRecordRepository(db)

    def get_status(self) -> StatusResponse:
        is_database_connected = check_database_connection()
        latest_recorded_at = self.price_record_repository.get_latest_recorded_at()

        return StatusResponse(
            backendStatus="online",
            databaseStatus="connected" if is_database_connected else "disconnected",
            version=settings.app_version,
            environment=settings.environment,
            lastPriceUpdate=(
                latest_recorded_at.isoformat() if latest_recorded_at else None
            ),
            lastImportStatus=None,
        )