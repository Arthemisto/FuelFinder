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