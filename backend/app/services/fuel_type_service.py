from sqlalchemy.orm import Session

from app.models.fuel_type_model import FuelType
from app.repositories.fuel_type_repository import FuelTypeRepository


class FuelTypeService:
    def __init__(self, db: Session):
        self.repository = FuelTypeRepository(db)

    def get_active_fuel_types(self) -> list[FuelType]:
        return self.repository.get_active_fuel_types()