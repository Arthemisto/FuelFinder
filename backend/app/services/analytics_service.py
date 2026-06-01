from collections import defaultdict
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.algorithms.forecast import PricePoint, calculate_linear_forecast
from app.repositories.price_record_repository import PriceRecordRepository
from app.schemas.analytics_schema import (
    FuelForecastPointResponse,
    FuelForecastResponse,
    FuelForecastsResponse,
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

    def get_fuel_forecasts(self) -> FuelForecastsResponse:
        rows = self.price_record_repository.get_average_prices_by_fuel_type_and_date()
        trend_map = defaultdict(list)
        label_map = {}

        for fuel_type_code, fuel_type_label, record_date, average_price in rows:
            label_map[fuel_type_code] = fuel_type_label
            trend_map[fuel_type_code].append(
                PricePoint(
                    date=record_date,
                    average_price=average_price,
                )
            )

        latest_date = self._get_latest_trend_date(trend_map)

        if not latest_date:
            return FuelForecastsResponse(forecasts=[])

        forecast_dates = [
            (latest_date + timedelta(days=days_ahead)).date().isoformat()
            for days_ahead in range(1, 4)
        ]

        forecasts = []

        for fuel_type_code, points in trend_map.items():
            forecast_points = calculate_linear_forecast(
                points=points,
                forecast_dates=forecast_dates,
            )

            forecasts.append(
                FuelForecastResponse(
                    fuel_type=fuel_type_code,
                    label=label_map[fuel_type_code],
                    points=[
                        FuelForecastPointResponse(
                            date=point.date,
                            predicted_price=point.predicted_price,
                        )
                        for point in forecast_points
                    ],
                )
            )

        return FuelForecastsResponse(forecasts=forecasts)

    def _get_latest_trend_date(
        self,
        trend_map: dict[str, list[PricePoint]],
    ) -> datetime | None:
        dates = [
            datetime.fromisoformat(point.date)
            for points in trend_map.values()
            for point in points
        ]

        if not dates:
            return None

        return max(dates)
