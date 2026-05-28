from sqlalchemy.orm import Session, joinedload

from app.models.station_model import Station


class StationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_active_stations(self) -> list[Station]:
        return (
            self.db.query(Station)
            .options(
                joinedload(Station.price_records),
            )
            .filter(Station.is_active.is_(True))
            .order_by(Station.name.asc())
            .all()
        )

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