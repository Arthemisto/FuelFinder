from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.status_schema import StatusResponse
from app.services.status_service import StatusService

router = APIRouter(prefix="/api/status", tags=["status"])


@router.get("", response_model=StatusResponse)
def get_status(db: Session = Depends(get_db)) -> StatusResponse:
    service = StatusService(db)
    return service.get_status()