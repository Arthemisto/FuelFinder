from sqlalchemy.orm import Session

from app.models.fuel_type_model import FuelType


class FuelTypeRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_active_fuel_types(self) -> list[FuelType]:
        return (
            self.db.query(FuelType)
            .filter(FuelType.is_active.is_(True))
            .order_by(FuelType.label.asc())
            .all()
        )