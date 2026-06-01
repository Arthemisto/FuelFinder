from sqlalchemy.orm import Session

from datetime import datetime, timedelta
from app.database import SessionLocal, create_database_tables
from app.models.fuel_type_model import FuelType
from app.models.price_record_model import PriceRecord
from app.models.station_fuel_type_model import StationFuelType
from app.models.station_model import Station

FUEL_TYPES = [
    {"code": "diesel", "label": "Diesel"},
    {"code": "petrol95", "label": "Petrol 95"},
    {"code": "petrol98", "label": "Petrol 98"},
    {"code": "lpg", "label": "LPG"},
    {"code": "diesel_plus", "label": "Diesel Plus"},
    {"code": "electric", "label": "Electric"},
]

STATIONS = [
    {
        "name": "Neste Skanste",
        "brand": "Neste",
        "address": "Skanstes iela 7",
        "city": "Riga",
        "latitude": 56.9713,
        "longitude": 24.121,
    },
    {
        "name": "Circle K Brivibas",
        "brand": "Circle K",
        "address": "Brivibas iela 100",
        "city": "Riga",
        "latitude": 56.9677,
        "longitude": 24.1456,
    },
    {
        "name": "Virsi Imanta",
        "brand": "Virsi",
        "address": "Kurzemes prospekts 3",
        "city": "Riga",
        "latitude": 56.9591,
        "longitude": 24.0108,
    },
    {
        "name": "Viada Jelgava",
        "brand": "Viada",
        "address": "Rupniecibas iela 2",
        "city": "Jelgava",
        "latitude": 56.6511,
        "longitude": 23.7214,
    },
    {
        "name": "Circle K Purvciems",
        "brand": "Circle K",
        "address": "Dzelzavas iela 74",
        "city": "Riga",
        "latitude": 56.9497,
        "longitude": 24.2054,
    },
]

STATION_FUEL_TYPES = [
    {"station_name": "Neste Skanste", "fuel_type_code": "diesel"},
    {"station_name": "Neste Skanste", "fuel_type_code": "petrol95"},
    {"station_name": "Circle K Brivibas", "fuel_type_code": "diesel"},
    {"station_name": "Circle K Brivibas", "fuel_type_code": "petrol95"},
    {"station_name": "Circle K Brivibas", "fuel_type_code": "petrol98"},
    {"station_name": "Virsi Imanta", "fuel_type_code": "diesel"},
    {"station_name": "Virsi Imanta", "fuel_type_code": "petrol95"},
    {"station_name": "Viada Jelgava", "fuel_type_code": "diesel"},
    {"station_name": "Viada Jelgava", "fuel_type_code": "lpg"},
    {"station_name": "Circle K Purvciems", "fuel_type_code": "petrol95"},
    {"station_name": "Circle K Purvciems", "fuel_type_code": "petrol98"},
]

PRICE_RECORDS = [
    {
        "station_name": "Neste Skanste",
        "fuel_type_code": "diesel",
        "price": 1.564,
        "currency": "EUR",
        "source": "seed",
    },
    {
        "station_name": "Neste Skanste",
        "fuel_type_code": "petrol95",
        "price": 1.629,
        "currency": "EUR",
        "source": "seed",
    },
    {
        "station_name": "Circle K Brivibas",
        "fuel_type_code": "diesel",
        "price": 1.589,
        "currency": "EUR",
        "source": "seed",
    },
    {
        "station_name": "Circle K Brivibas",
        "fuel_type_code": "petrol95",
        "price": 1.638,
        "currency": "EUR",
        "source": "seed",
    },
    {
        "station_name": "Circle K Brivibas",
        "fuel_type_code": "petrol98",
        "price": 1.724,
        "currency": "EUR",
        "source": "seed",
    },
    {
        "station_name": "Virsi Imanta",
        "fuel_type_code": "diesel",
        "price": 1.571,
        "currency": "EUR",
        "source": "seed",
    },
    {
        "station_name": "Virsi Imanta",
        "fuel_type_code": "petrol95",
        "price": 1.619,
        "currency": "EUR",
        "source": "seed",
    },
    {
        "station_name": "Viada Jelgava",
        "fuel_type_code": "diesel",
        "price": 1.552,
        "currency": "EUR",
        "source": "seed",
    },
    {
        "station_name": "Viada Jelgava",
        "fuel_type_code": "lpg",
        "price": 0.765,
        "currency": "EUR",
        "source": "seed",
    },
    {
        "station_name": "Circle K Purvciems",
        "fuel_type_code": "petrol95",
        "price": 1.638,
        "currency": "EUR",
        "source": "seed",
    },
    {
        "station_name": "Circle K Purvciems",
        "fuel_type_code": "petrol98",
        "price": 1.724,
        "currency": "EUR",
        "source": "seed",
    },
]

HISTORICAL_PRICE_RECORDS = [
    {
        "days_ago": 3,
        "station_name": "Neste Skanste",
        "fuel_type_code": "diesel",
        "price": 1.552,
        "currency": "EUR",
        "source": "seed_history",
    },
    {
        "days_ago": 2,
        "station_name": "Neste Skanste",
        "fuel_type_code": "diesel",
        "price": 1.558,
        "currency": "EUR",
        "source": "seed_history",
    },
    {
        "days_ago": 1,
        "station_name": "Neste Skanste",
        "fuel_type_code": "diesel",
        "price": 1.561,
        "currency": "EUR",
        "source": "seed_history",
    },
    {
        "days_ago": 3,
        "station_name": "Circle K Brivibas",
        "fuel_type_code": "petrol95",
        "price": 1.622,
        "currency": "EUR",
        "source": "seed_history",
    },
    {
        "days_ago": 2,
        "station_name": "Circle K Brivibas",
        "fuel_type_code": "petrol95",
        "price": 1.629,
        "currency": "EUR",
        "source": "seed_history",
    },
    {
        "days_ago": 1,
        "station_name": "Circle K Brivibas",
        "fuel_type_code": "petrol95",
        "price": 1.635,
        "currency": "EUR",
        "source": "seed_history",
    },
    {
        "days_ago": 3,
        "station_name": "Viada Jelgava",
        "fuel_type_code": "lpg",
        "price": 0.755,
        "currency": "EUR",
        "source": "seed_history",
    },
    {
        "days_ago": 2,
        "station_name": "Viada Jelgava",
        "fuel_type_code": "lpg",
        "price": 0.759,
        "currency": "EUR",
        "source": "seed_history",
    },
    {
        "days_ago": 1,
        "station_name": "Viada Jelgava",
        "fuel_type_code": "lpg",
        "price": 0.762,
        "currency": "EUR",
        "source": "seed_history",
    },
        {
        "days_ago": 3,
        "station_name": "Circle K Brivibas",
        "fuel_type_code": "petrol98",
        "price": 1.708,
        "currency": "EUR",
        "source": "seed_history",
    },
    {
        "days_ago": 2,
        "station_name": "Circle K Brivibas",
        "fuel_type_code": "petrol98",
        "price": 1.716,
        "currency": "EUR",
        "source": "seed_history",
    },
    {
        "days_ago": 1,
        "station_name": "Circle K Brivibas",
        "fuel_type_code": "petrol98",
        "price": 1.721,
        "currency": "EUR",
        "source": "seed_history",
    },
]

def seed_fuel_types(db: Session) -> None:
    for fuel_type_data in FUEL_TYPES:
        existing_fuel_type = (
            db.query(FuelType)
            .filter(FuelType.code == fuel_type_data["code"])
            .first()
        )

        if existing_fuel_type:
            continue

        db.add(FuelType(**fuel_type_data))

    db.commit()


def seed_stations(db: Session) -> None:
    for station_data in STATIONS:
        existing_station = (
            db.query(Station)
            .filter(
                Station.name == station_data["name"],
                Station.address == station_data["address"],
            )
            .first()
        )

        if existing_station:
            continue

        db.add(Station(**station_data))

    db.commit()


def seed_station_fuel_types(db: Session) -> None:
    for station_fuel_type_data in STATION_FUEL_TYPES:
        station = (
            db.query(Station)
            .filter(Station.name == station_fuel_type_data["station_name"])
            .first()
        )
        fuel_type = (
            db.query(FuelType)
            .filter(FuelType.code == station_fuel_type_data["fuel_type_code"])
            .first()
        )

        if not station or not fuel_type:
            continue

        existing_station_fuel_type = (
            db.query(StationFuelType)
            .filter(
                StationFuelType.station_id == station.id,
                StationFuelType.fuel_type_id == fuel_type.id,
            )
            .first()
        )

        if existing_station_fuel_type:
            continue

        db.add(
            StationFuelType(
                station_id=station.id,
                fuel_type_id=fuel_type.id,
            )
        )

    db.commit()


def seed_price_records(db: Session) -> None:
    for price_record_data in PRICE_RECORDS:
        station = (
            db.query(Station)
            .filter(Station.name == price_record_data["station_name"])
            .first()
        )
        fuel_type = (
            db.query(FuelType)
            .filter(FuelType.code == price_record_data["fuel_type_code"])
            .first()
        )

        if not station or not fuel_type:
            continue

        existing_price_record = (
            db.query(PriceRecord)
            .filter(
                PriceRecord.station_id == station.id,
                PriceRecord.fuel_type_id == fuel_type.id,
                PriceRecord.source == price_record_data["source"],
                PriceRecord.is_current == True,
            )
            .first()
        )

        if existing_price_record:
            continue

        db.add(
            PriceRecord(
                station_id=station.id,
                fuel_type_id=fuel_type.id,
                price=price_record_data["price"],
                currency=price_record_data["currency"],
                source=price_record_data["source"],
                is_current=True,
            )
        )

    db.commit()

def seed_historical_price_records(db: Session) -> None:
    for price_record_data in HISTORICAL_PRICE_RECORDS:
        station = (
            db.query(Station)
            .filter(Station.name == price_record_data["station_name"])
            .first()
        )
        fuel_type = (
            db.query(FuelType)
            .filter(FuelType.code == price_record_data["fuel_type_code"])
            .first()
        )

        if not station or not fuel_type:
            continue

        recorded_at = datetime.utcnow() - timedelta(
            days=price_record_data["days_ago"],
        )

        existing_price_record = (
            db.query(PriceRecord)
            .filter(
                PriceRecord.station_id == station.id,
                PriceRecord.fuel_type_id == fuel_type.id,
                PriceRecord.source == price_record_data["source"],
                PriceRecord.recorded_at >= recorded_at.replace(
                    hour=0,
                    minute=0,
                    second=0,
                    microsecond=0,
                ),
                PriceRecord.recorded_at < recorded_at.replace(
                    hour=23,
                    minute=59,
                    second=59,
                    microsecond=999999,
                ),
            )
            .first()
        )

        if existing_price_record:
            continue

        db.add(
            PriceRecord(
                station_id=station.id,
                fuel_type_id=fuel_type.id,
                price=price_record_data["price"],
                currency=price_record_data["currency"],
                source=price_record_data["source"],
                recorded_at=recorded_at,
                is_current=False,
            )
        )

    db.commit()

def seed_database() -> None:
    create_database_tables()

    with SessionLocal() as db:
        print("Database seed started.")
        seed_fuel_types(db)
        print("Fuel types seeded.")
        seed_stations(db)
        print("Stations seeded.")
        seed_station_fuel_types(db)
        print("Station fuel types seeded.")
        seed_price_records(db)
        print("Price records seeded.")
        seed_historical_price_records(db)
        print("Historical price records seeded.")
        print("Database seed finished.")

if __name__ == "__main__":
    seed_database()