from sqlalchemy import Boolean, ForeignKey, Identity, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class StationFuelType(Base):
    __tablename__ = "station_fuel_types"
    __table_args__ = (
        UniqueConstraint(
            "station_id",
            "fuel_type_id",
            name="uq_station_fuel_type",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, Identity(), primary_key=True)
    station_id: Mapped[int] = mapped_column(
        ForeignKey("stations.id"),
        nullable=False,
    )
    fuel_type_id: Mapped[int] = mapped_column(
        ForeignKey("fuel_types.id"),
        nullable=False,
    )
    is_available: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    station = relationship("Station", back_populates="fuel_types")
    fuel_type = relationship("FuelType", back_populates="stations")