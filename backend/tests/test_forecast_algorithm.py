from app.algorithms.forecast import PricePoint, calculate_linear_forecast


def test_calculate_linear_forecast_returns_empty_list_without_points() -> None:
    forecast = calculate_linear_forecast(
        points=[],
        forecast_dates=["2026-05-29"],
    )

    assert forecast == []


def test_calculate_linear_forecast_uses_flat_prediction_for_one_point() -> None:
    forecast = calculate_linear_forecast(
        points=[
            PricePoint(date="2026-05-28", average_price=1.55),
        ],
        forecast_dates=["2026-05-29", "2026-05-30"],
    )

    assert [point.predicted_price for point in forecast] == [1.55, 1.55]


def test_calculate_linear_forecast_projects_latest_daily_change() -> None:
    forecast = calculate_linear_forecast(
        points=[
            PricePoint(date="2026-05-27", average_price=1.55),
            PricePoint(date="2026-05-28", average_price=1.57),
        ],
        forecast_dates=["2026-05-29", "2026-05-30", "2026-05-31"],
    )

    assert [point.predicted_price for point in forecast] == [1.59, 1.61, 1.63]
