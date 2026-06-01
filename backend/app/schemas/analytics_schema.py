from pydantic import BaseModel


class FuelTrendPointResponse(BaseModel):
    date: str
    average_price: float


class FuelTrendResponse(BaseModel):
    fuel_type: str
    label: str
    points: list[FuelTrendPointResponse]


class FuelTrendsResponse(BaseModel):
    trends: list[FuelTrendResponse]


class FuelForecastPointResponse(BaseModel):
    date: str
    predicted_price: float


class FuelForecastResponse(BaseModel):
    fuel_type: str
    label: str
    points: list[FuelForecastPointResponse]


class FuelForecastsResponse(BaseModel):
    forecasts: list[FuelForecastResponse]
