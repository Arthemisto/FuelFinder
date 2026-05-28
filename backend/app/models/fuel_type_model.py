from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class FuelType(Base):
    __tablename__ = "fuel_types"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(40), nullable=False, unique=True)
    label: Mapped[str] = mapped_column(String(80), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    stations = relationship(
        "StationFuelType",
        back_populates="fuel_type",
        cascade="all, delete-orphan",
    )
    price_records = relationship(
        "PriceRecord",
        back_populates="fuel_type",
        cascade="all, delete-orphan",
    )