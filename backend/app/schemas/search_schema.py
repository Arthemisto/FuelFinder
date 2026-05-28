from pydantic import BaseModel, Field


class SearchStationFuelResponse(BaseModel):
    fuel_type_code: str
    fuel_type_label: str
    price: float
    currency: str


class SearchStationResponse(BaseModel):
    id: int
    name: str
    brand: str
    address: str
    city: str
    latitude: float
    longitude: float
    distance_km: float
    best_value_score: float
    fuel: SearchStationFuelResponse


class SearchResponse(BaseModel):
    latitude: float
    longitude: float
    radius_km: float
    fuel_type: str
    stations: list[SearchStationResponse]


class SearchQuery(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    radius_km: float = Field(gt=0, le=200)
    fuel_type: str