from collections import defaultdict

from sqlalchemy.orm import Session

from app.repositories.price_record_repository import PriceRecordRepository
from app.schemas.analytics_schema import (
    FuelTrendPointResponse,
    FuelTrendResponse,
    FuelTrendsResponse,
)


class AnalyticsService:
    def __init__(self, db: Session):
        self.price_record_repository = PriceRecordRepository(db)

    def get_fuel_trends(self) -> FuelTrendsResponse:
        rows = self.price_record_repository.get_average_prices_by_fuel_type_and_date()
        trend_map = defaultdict(list)
        label_map = {}

        for fuel_type_code, fuel_type_label, record_date, average_price in rows:
            label_map[fuel_type_code] = fuel_type_label
            trend_map[fuel_type_code].append(
                FuelTrendPointResponse(
                    date=record_date,
                    average_price=average_price,
                )
            )

        trends = [
            FuelTrendResponse(
                fuel_type=fuel_type_code,
                label=label_map[fuel_type_code],
                points=points,
            )
            for fuel_type_code, points in trend_map.items()
        ]

        return FuelTrendsResponse(trends=trends)