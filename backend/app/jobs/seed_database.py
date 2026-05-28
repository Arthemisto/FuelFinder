from sqlalchemy.orm import Session

from app.database import SessionLocal, create_database_tables
from app.models.fuel_type_model import FuelType
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
        print("Database seed finished.")
        
if __name__ == "__main__":
    seed_database()