from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.station_schema import StationResponse
from app.services.station_service import StationService

router = APIRouter(prefix="/api/stations", tags=["stations"])


@router.get("", response_model=list[StationResponse])
def get_stations(db: Session = Depends(get_db)) -> list[StationResponse]:
    service = StationService(db)
    return service.get_active_stations()