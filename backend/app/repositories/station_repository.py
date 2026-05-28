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
        fuel_type: str | None = None,
        sort: str | None = None,
    ) -> list[Station]:
        query = (
            self.db.query(Station)
            .options(
                joinedload(Station.price_records),
            )
            .filter(Station.is_active.is_(True))
        )

        if city:
            query = query.filter(Station.city.ilike(city))

        if fuel_type:
            query = (
                query.join(PriceRecord)
                .join(FuelType)
                .filter(
                    PriceRecord.is_current.is_(True),
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
                Station.is_active.is_(True),
            )
            .first()
        )