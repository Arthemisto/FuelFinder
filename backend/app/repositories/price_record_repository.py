from collections import defaultdict
from datetime import datetime

from sqlalchemy import func
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
        rows = (
            self.db.query(
                FuelType.code,
                FuelType.label,
                PriceRecord.recorded_at,
                PriceRecord.price,
            )
            .join(PriceRecord, PriceRecord.fuel_type_id == FuelType.id)
            .order_by(
                FuelType.label.asc(),
                PriceRecord.recorded_at.asc(),
            )
            .all()
        )

        grouped_prices: dict[tuple[str, str, str], list[float]] = defaultdict(list)

        for fuel_type_code, fuel_type_label, recorded_at, price in rows:
            record_date = recorded_at.date().isoformat()
            grouped_prices[
                (
                    fuel_type_code,
                    fuel_type_label,
                    record_date,
                )
            ].append(price)

        return [
            (
                fuel_type_code,
                fuel_type_label,
                record_date,
                round(sum(prices) / len(prices), 3),
            )
            for (
                fuel_type_code,
                fuel_type_label,
                record_date,
            ), prices in sorted(
                grouped_prices.items(),
                key=lambda item: (item[0][1], item[0][2]),
            )
        ]