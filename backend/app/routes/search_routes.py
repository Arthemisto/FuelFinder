from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.search_schema import SearchResponse
from app.services.search_service import SearchService

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("", response_model=SearchResponse)
def search_stations(
    latitude: float = Query(ge=-90, le=90),
    longitude: float = Query(ge=-180, le=180),
    radius_km: float = Query(gt=0, le=200),
    fuel_type: str = Query(min_length=1),
    db: Session = Depends(get_db),
) -> SearchResponse:
    service = SearchService(db)
    return service.search_stations(
        latitude=latitude,
        longitude=longitude,
        radius_km=radius_km,
        fuel_type=fuel_type,
    )