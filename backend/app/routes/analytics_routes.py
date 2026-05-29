from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.analytics_schema import FuelTrendsResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/fuel-trends", response_model=FuelTrendsResponse)
def get_fuel_trends(db: Session = Depends(get_db)) -> FuelTrendsResponse:
    service = AnalyticsService(db)
    return service.get_fuel_trends()