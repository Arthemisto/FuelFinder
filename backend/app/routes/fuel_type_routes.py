from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.fuel_type_schema import FuelTypeResponse
from app.services.fuel_type_service import FuelTypeService

router = APIRouter(prefix="/api/fuel-types", tags=["fuel-types"])


@router.get("", response_model=list[FuelTypeResponse])
def get_fuel_types(db: Session = Depends(get_db)) -> list[FuelTypeResponse]:
    service = FuelTypeService(db)
    return service.get_active_fuel_types()