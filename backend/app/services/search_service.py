from sqlalchemy.orm import Session

from app.algorithms.distance import calculate_distance_km
from app.models.price_record_model import PriceRecord
from app.models.station_model import Station
from app.repositories.station_repository import StationRepository
from app.schemas.search_schema import (
    SearchResponse,
    SearchStationFuelResponse,
    SearchStationResponse,
)


class SearchService:
    def __init__(self, db: Session):
        self.station_repository = StationRepository(db)

    def search_stations(
        self,
        latitude: float,
        longitude: float,
        radius_km: float,
        fuel_type: str,
    ) -> SearchResponse:
        stations = self.station_repository.get_active_stations_by_fuel_type(
            fuel_type=fuel_type,
        )

        search_results = []

        for station in stations:
            matching_price_record = self._get_current_price_record(
                station=station,
                fuel_type=fuel_type,
            )

            if not matching_price_record:
                continue

            distance_km = calculate_distance_km(
                latitude,
                longitude,
                station.latitude,
                station.longitude,
            )

            if distance_km > radius_km:
                continue

            search_results.append(
                SearchStationResponse(
                    id=station.id,
                    name=station.name,
                    brand=station.brand,
                    address=station.address,
                    city=station.city,
                    latitude=station.latitude,
                    longitude=station.longitude,
                    distance_km=round(distance_km, 2),
                    best_value_score=round(
                        matching_price_record.price + distance_km * 0.01,
                        4,
                    ),
                    fuel=SearchStationFuelResponse(
                        fuel_type_code=matching_price_record.fuel_type.code,
                        fuel_type_label=matching_price_record.fuel_type.label,
                        price=matching_price_record.price,
                        currency=matching_price_record.currency,
                    ),
                )
            )

        search_results.sort(key=lambda station: station.best_value_score)

        return SearchResponse(
            latitude=latitude,
            longitude=longitude,
            radius_km=radius_km,
            fuel_type=fuel_type,
            stations=search_results,
        )

    def _get_current_price_record(
        self,
        station: Station,
        fuel_type: str,
    ) -> PriceRecord | None:
        for price_record in station.price_records:
            if (
                price_record.is_current
                and price_record.fuel_type.code == fuel_type
            ):
                return price_record

        return None