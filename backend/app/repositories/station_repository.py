from sqlalchemy.orm import Session, joinedload

from app.models.fuel_type_model import FuelType
from app.models.price_record_model import PriceRecord
from app.models.station_model import Station


class StationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_active_stations(
        self,
        city: str | None = None,
        brand: str | None = None,
        fuel_type: str | None = None,
        sort: str | None = None,
    ) -> list[Station]:
        query = (
            self.db.query(Station)
            .options(
                joinedload(Station.price_records),
            )
            .filter(Station.is_active == True)
        )

        if city:
            query = query.filter(Station.city.ilike(city))

        if brand:
            query = query.filter(Station.brand.ilike(brand))

        if fuel_type:
            query = (
                query.join(PriceRecord)
                .join(FuelType)
                .filter(
                    PriceRecord.is_current == True,
                    FuelType.code == fuel_type,
                )
            )

            if sort == "price_asc":
                query = query.order_by(PriceRecord.price.asc())
            elif sort == "price_desc":
                query = query.order_by(PriceRecord.price.desc())
            else:
                query = query.order_by(Station.name.asc())

            return query.all()

        return query.order_by(Station.name.asc()).all()

    def get_active_station_by_id(self, station_id: int) -> Station | None:
        return (
            self.db.query(Station)
            .options(
                joinedload(Station.price_records),
            )
            .filter(
                Station.id == station_id,
                Station.is_active == True,
            )
            .first()
        )

    def get_active_stations_by_fuel_type(self, fuel_type: str) -> list[Station]:
        return (
            self.db.query(Station)
            .options(
                joinedload(Station.price_records),
            )
            .join(PriceRecord)
            .join(FuelType)
            .filter(
                Station.is_active == True,
                PriceRecord.is_current == True,
                FuelType.code == fuel_type,
            )
            .order_by(Station.name.asc())
            .all()
        )

    def get_active_cities(self) -> list[str]:
        rows = (
            self.db.query(Station.city)
            .filter(Station.is_active == True)
            .distinct()
            .order_by(Station.city.asc())
            .all()
        )

        return [row[0] for row in rows]

    def get_active_brands(self) -> list[str]:
        rows = (
            self.db.query(Station.brand)
            .filter(Station.is_active == True)
            .distinct()
            .order_by(Station.brand.asc())
            .all()
        )

        return [row[0] for row in rows]