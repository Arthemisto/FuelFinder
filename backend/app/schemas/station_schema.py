from pydantic import BaseModel


class StationFuelPriceResponse(BaseModel):
    fuel_type_code: str
    fuel_type_label: str
    price: float
    currency: str


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