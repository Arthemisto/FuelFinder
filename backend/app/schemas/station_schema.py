from datetime import datetime

from pydantic import BaseModel


class StationFuelPriceResponse(BaseModel):
    fuel_type_code: str
    fuel_type_label: str
    price: float
    currency: str
    recorded_at: datetime


class StationResponse(BaseModel):
    id: int
    name: str
    brand: str
    address: str
    city: str
    latitude: float
    longitude: float
    is_active: bool
    fuels: list[StationFuelPriceResponse]


class StationFiltersResponse(BaseModel):
    cities: list[str]
    brands: list[str]