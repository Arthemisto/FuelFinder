from dataclasses import dataclass


@dataclass(frozen=True)
class PricePoint:
    date: str
    average_price: float


@dataclass(frozen=True)
class ForecastPoint:
    date: str
    predicted_price: float


def calculate_linear_forecast(
    points: list[PricePoint],
    forecast_dates: list[str],
) -> list[ForecastPoint]:
    if not points:
        return []

    sorted_points = sorted(points, key=lambda point: point.date)
    latest_point = sorted_points[-1]
    previous_point = sorted_points[-2] if len(sorted_points) >= 2 else None

    daily_change = (
        latest_point.average_price - previous_point.average_price
        if previous_point
        else 0
    )

    return [
        ForecastPoint(
            date=forecast_date,
            predicted_price=round(
                latest_point.average_price + daily_change * (index + 1),
                3,
            ),
        )
        for index, forecast_date in enumerate(forecast_dates)
    ]
