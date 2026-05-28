from sqlalchemy.orm import Session

from app.models.station_model import Station
from app.repositories.station_repository import StationRepository
from app.schemas.station_schema import StationFuelPriceResponse, StationResponse


class StationService:
    def __init__(self, db: Session):
        self.repository = StationRepository(db)

    def get_active_stations(self) -> list[StationResponse]:
        stations = self.repository.get_active_stations()

        return [self._build_station_response(station) for station in stations]

    def _build_station_response(self, station: Station) -> StationResponse:
        fuels = [
            StationFuelPriceResponse(
                fuel_type_code=price_record.fuel_type.code,
                fuel_type_label=price_record.fuel_type.label,
                price=price_record.price,
                currency=price_record.currency,
            )
            for price_record in station.price_records
            if price_record.is_current
        ]

        return StationResponse(
            id=station.id,
            name=station.name,
            brand=station.brand,
            address=station.address,
            city=station.city,
            latitude=station.latitude,
            longitude=station.longitude,
            is_active=station.is_active,
            fuels=fuels,
        )