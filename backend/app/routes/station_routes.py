from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.station_schema import StationResponse
from app.services.station_service import StationService

router = APIRouter(prefix="/api/stations", tags=["stations"])


@router.get("", response_model=list[StationResponse])
def get_stations(
    city: str | None = Query(default=None),
    fuel_type: str | None = Query(default=None),
    sort: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[StationResponse]:
    service = StationService(db)
    return service.get_active_stations(
        city=city,
        fuel_type=fuel_type,
        sort=sort,
    )


@router.get("/{station_id}", response_model=StationResponse)
def get_station_by_id(
    station_id: int,
    db: Session = Depends(get_db),
) -> StationResponse:
    service = StationService(db)
    station = service.get_active_station_by_id(station_id)

    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    return station
