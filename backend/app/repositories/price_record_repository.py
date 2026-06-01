from datetime import datetime

from sqlalchemy import Date, cast, func
from sqlalchemy.orm import Session

from app.models.fuel_type_model import FuelType
from app.models.price_record_model import PriceRecord


class PriceRecordRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_latest_recorded_at(self) -> datetime | None:
        return self.db.query(func.max(PriceRecord.recorded_at)).scalar()

    def get_average_prices_by_fuel_type_and_date(
        self,
    ) -> list[tuple[str, str, str, float]]:
        record_date = cast(PriceRecord.recorded_at, Date)

        rows = (
            self.db.query(
                FuelType.code,
                FuelType.label,
                record_date,
                func.avg(PriceRecord.price),
            )
            .join(PriceRecord, PriceRecord.fuel_type_id == FuelType.id)
            .group_by(
                FuelType.code,
                FuelType.label,
                record_date,
            )
            .order_by(
                FuelType.label.asc(),
                record_date.asc(),
            )
            .all()
        )

        return [
            (
                fuel_type_code,
                fuel_type_label,
                record_date.isoformat()
                if hasattr(record_date, "isoformat")
                else str(record_date),
                round(average_price, 3),
            )
            for (
                fuel_type_code,
                fuel_type_label,
                record_date,
                average_price,
            ) in rows
        ]