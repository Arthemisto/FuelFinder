from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.price_record_model import PriceRecord


class PriceRecordRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_latest_recorded_at(self) -> datetime | None:
        return self.db.query(func.max(PriceRecord.recorded_at)).scalar()