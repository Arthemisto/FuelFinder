from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Identity, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class PriceRecord(Base):
    __tablename__ = "price_records"

    id: Mapped[int] = mapped_column(Integer, Identity(), primary_key=True)
    station_id: Mapped[int] = mapped_column(
        ForeignKey("stations.id"),
        nullable=False,
        index=True,
    )
    fuel_type_id: Mapped[int] = mapped_column(
        ForeignKey("fuel_types.id"),
        nullable=False,
        index=True,
    )
    price: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="EUR")
    source: Mapped[str] = mapped_column(String(80), nullable=False, default="seed")
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        index=True,
    )
    is_current: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    station = relationship("Station", back_populates="price_records")
    fuel_type = relationship("FuelType", back_populates="price_records")