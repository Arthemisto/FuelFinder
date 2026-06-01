from __future__ import annotations

from datetime import datetime, timedelta
from math import sin

from sqlalchemy.orm import Session

from app.database import SessionLocal, create_database_tables
from app.models.fuel_type_model import FuelType
from app.models.price_record_model import PriceRecord
from app.models.station_fuel_type_model import StationFuelType
from app.models.station_model import Station


CURRENT_SOURCE = "demo_seed_current"
HISTORY_SOURCE = "demo_seed_history"
HISTORY_START = datetime(2025, 6, 1, 10, 0, 0)
HISTORY_END = datetime(2026, 6, 1, 10, 0, 0)

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
        "longitude": 24.1210,
        "fuels": ["diesel", "diesel_plus", "petrol95", "petrol98"],
    },
    {
        "name": "Circle K Brivibas",
        "brand": "Circle K",
        "address": "Brivibas iela 100",
        "city": "Riga",
        "latitude": 56.9677,
        "longitude": 24.1456,
        "fuels": ["diesel", "diesel_plus", "petrol95", "petrol98", "lpg"],
    },
    {
        "name": "Virsi Imanta",
        "brand": "Virsi",
        "address": "Kurzemes prospekts 3",
        "city": "Riga",
        "latitude": 56.9591,
        "longitude": 24.0108,
        "fuels": ["diesel", "petrol95", "lpg"],
    },
    {
        "name": "Circle K Purvciems",
        "brand": "Circle K",
        "address": "Dzelzavas iela 74",
        "city": "Riga",
        "latitude": 56.9497,
        "longitude": 24.2054,
        "fuels": ["diesel", "diesel_plus", "petrol95", "petrol98"],
    },
    {
        "name": "Viada Krasta",
        "brand": "Viada",
        "address": "Krasta iela 101",
        "city": "Riga",
        "latitude": 56.9239,
        "longitude": 24.1708,
        "fuels": ["diesel", "petrol95", "petrol98", "lpg"],
    },
    {
        "name": "Kool Teika",
        "brand": "Kool",
        "address": "Brivibas gatve 214",
        "city": "Riga",
        "latitude": 56.9784,
        "longitude": 24.1903,
        "fuels": ["diesel", "petrol95", "petrol98"],
    },
    {
        "name": "Neste Ziepniekkalns",
        "brand": "Neste",
        "address": "Vienibas gatve 115",
        "city": "Riga",
        "latitude": 56.9088,
        "longitude": 24.0798,
        "fuels": ["diesel", "diesel_plus", "petrol95"],
    },
    {
        "name": "Circle K Jugla",
        "brand": "Circle K",
        "address": "Brivibas gatve 434",
        "city": "Riga",
        "latitude": 56.9868,
        "longitude": 24.2561,
        "fuels": ["diesel", "diesel_plus", "petrol95", "petrol98", "lpg"],
    },
    {
        "name": "Virsi Sarkandaugava",
        "brand": "Virsi",
        "address": "Tilta iela 32",
        "city": "Riga",
        "latitude": 57.0041,
        "longitude": 24.1285,
        "fuels": ["diesel", "petrol95", "lpg"],
    },
    {
        "name": "Viada Vecmilgravis",
        "brand": "Viada",
        "address": "Meldru iela 1",
        "city": "Riga",
        "latitude": 57.0348,
        "longitude": 24.1057,
        "fuels": ["diesel", "petrol95", "petrol98"],
    },
    {
        "name": "Kool Agenskalns",
        "brand": "Kool",
        "address": "Kalnciema iela 88",
        "city": "Riga",
        "latitude": 56.9412,
        "longitude": 24.0462,
        "fuels": ["diesel", "petrol95", "petrol98", "lpg"],
    },
    {
        "name": "Neste Dreilini",
        "brand": "Neste",
        "address": "Bikernieku iela 145",
        "city": "Riga",
        "latitude": 56.9587,
        "longitude": 24.2369,
        "fuels": ["diesel", "diesel_plus", "petrol95"],
    },
    {
        "name": "Circle K Kengarags",
        "brand": "Circle K",
        "address": "Maskavas iela 450",
        "city": "Riga",
        "latitude": 56.9018,
        "longitude": 24.1993,
        "fuels": ["diesel", "diesel_plus", "petrol95", "petrol98"],
    },
    {
        "name": "Virsi Pleskodale",
        "brand": "Virsi",
        "address": "Karla Ulmana gatve 88",
        "city": "Riga",
        "latitude": 56.9297,
        "longitude": 24.0103,
        "fuels": ["diesel", "petrol95", "lpg"],
    },
    {
        "name": "Viada Milgravis",
        "brand": "Viada",
        "address": "Jaunciema gatve 45",
        "city": "Riga",
        "latitude": 57.0127,
        "longitude": 24.1818,
        "fuels": ["diesel", "petrol95", "petrol98"],
    },
    {
        "name": "Viada Jelgava",
        "brand": "Viada",
        "address": "Rupniecibas iela 2",
        "city": "Jelgava",
        "latitude": 56.6511,
        "longitude": 23.7214,
        "fuels": ["diesel", "petrol95", "lpg"],
    },
    {
        "name": "Circle K Jelgava Center",
        "brand": "Circle K",
        "address": "Liela iela 42",
        "city": "Jelgava",
        "latitude": 56.6529,
        "longitude": 23.7307,
        "fuels": ["diesel", "diesel_plus", "petrol95", "petrol98"],
    },
    {
        "name": "Neste Jurmala",
        "brand": "Neste",
        "address": "Dubultu prospekts 5",
        "city": "Jurmala",
        "latitude": 56.9685,
        "longitude": 23.7702,
        "fuels": ["diesel", "diesel_plus", "petrol95"],
    },
    {
        "name": "Kool Ogre",
        "brand": "Kool",
        "address": "Rigas iela 23",
        "city": "Ogre",
        "latitude": 56.8162,
        "longitude": 24.6041,
        "fuels": ["diesel", "petrol95", "petrol98", "lpg"],
    },
    {
        "name": "Virsi Salaspils",
        "brand": "Virsi",
        "address": "Energetiku iela 4",
        "city": "Salaspils",
        "latitude": 56.8615,
        "longitude": 24.3497,
        "fuels": ["diesel", "petrol95", "lpg"],
    },
    {
        "name": "Circle K Sigulda",
        "brand": "Circle K",
        "address": "Vidzemes soseja 16",
        "city": "Sigulda",
        "latitude": 57.1517,
        "longitude": 24.8531,
        "fuels": ["diesel", "diesel_plus", "petrol95", "petrol98"],
    },
    {
        "name": "Neste Tukums",
        "brand": "Neste",
        "address": "Kurzemes iela 2",
        "city": "Tukums",
        "latitude": 56.9668,
        "longitude": 23.1553,
        "fuels": ["diesel", "diesel_plus", "petrol95"],
    },
    {
        "name": "Viada Cesis",
        "brand": "Viada",
        "address": "Valmieras iela 21",
        "city": "Cesis",
        "latitude": 57.3132,
        "longitude": 25.2795,
        "fuels": ["diesel", "petrol95", "petrol98", "lpg"],
    },
    {
        "name": "Virsi Bauska",
        "brand": "Virsi",
        "address": "Kalna iela 12",
        "city": "Bauska",
        "latitude": 56.4074,
        "longitude": 24.1905,
        "fuels": ["diesel", "petrol95", "lpg"],
    },
    {
        "name": "Kool Valmiera",
        "brand": "Kool",
        "address": "Rigas iela 91",
        "city": "Valmiera",
        "latitude": 57.5350,
        "longitude": 25.4244,
        "fuels": ["diesel", "petrol95", "petrol98"],
    },
]

BASE_PRICES = {
    "diesel": 1.541,
    "diesel_plus": 1.619,
    "petrol95": 1.591,
    "petrol98": 1.688,
    "lpg": 0.765,
}

BRAND_MODIFIERS = {
    "Neste": -0.010,
    "Circle K": 0.018,
    "Virsi": -0.006,
    "Viada": -0.018,
    "Kool": -0.012,
}

FUEL_MINIMUMS = {
    "diesel": 1.35,
    "diesel_plus": 1.42,
    "petrol95": 1.40,
    "petrol98": 1.48,
    "lpg": 0.60,
}


def seed_fuel_types(db: Session) -> None:
    for fuel_type_data in FUEL_TYPES:
        existing_fuel_type = (
            db.query(FuelType)
            .filter(FuelType.code == fuel_type_data["code"])
            .first()
        )

        if existing_fuel_type:
            existing_fuel_type.label = fuel_type_data["label"]
            existing_fuel_type.is_active = True
            continue

        db.add(FuelType(**fuel_type_data))

    db.commit()


def seed_stations(db: Session) -> None:
    for station_data in STATIONS:
        clean_station_data = {
            key: value
            for key, value in station_data.items()
            if key != "fuels"
        }
        existing_station = (
            db.query(Station)
            .filter(
                Station.name == clean_station_data["name"],
                Station.address == clean_station_data["address"],
            )
            .first()
        )

        if existing_station:
            for key, value in clean_station_data.items():
                setattr(existing_station, key, value)
            existing_station.is_active = True
            continue

        db.add(Station(**clean_station_data))

    db.commit()


def seed_station_fuel_types(db: Session) -> None:
    station_map = {station.name: station for station in db.query(Station).all()}
    fuel_type_map = {
        fuel_type.code: fuel_type
        for fuel_type in db.query(FuelType).all()
    }

    for station_data in STATIONS:
        station = station_map.get(station_data["name"])

        if not station:
            continue

        for fuel_type_code in station_data["fuels"]:
            fuel_type = fuel_type_map.get(fuel_type_code)

            if not fuel_type:
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
                existing_station_fuel_type.is_available = True
                continue

            db.add(
                StationFuelType(
                    station_id=station.id,
                    fuel_type_id=fuel_type.id,
                    is_available=True,
                )
            )

    db.commit()


def seed_price_records(db: Session) -> None:
    station_map = {station.name: station for station in db.query(Station).all()}
    fuel_type_map = {
        fuel_type.code: fuel_type
        for fuel_type in db.query(FuelType).all()
    }

    for station_index, station_data in enumerate(STATIONS):
        station = station_map.get(station_data["name"])

        if not station:
            continue

        for fuel_type_code in station_data["fuels"]:
            fuel_type = fuel_type_map.get(fuel_type_code)

            if not fuel_type:
                continue

            price = calculate_demo_price(
                fuel_type_code=fuel_type_code,
                brand=station_data["brand"],
                station_index=station_index,
                record_date=HISTORY_END,
            )

            existing_current_records = (
                db.query(PriceRecord)
                .filter(
                    PriceRecord.station_id == station.id,
                    PriceRecord.fuel_type_id == fuel_type.id,
                    PriceRecord.is_current == True,
                )
                .all()
            )

            demo_current_record = None
            for price_record in existing_current_records:
                if price_record.source == CURRENT_SOURCE:
                    demo_current_record = price_record
                else:
                    price_record.is_current = False

            if demo_current_record:
                demo_current_record.price = price
                demo_current_record.currency = "EUR"
                demo_current_record.recorded_at = HISTORY_END
                demo_current_record.is_current = True
                continue

            db.add(
                PriceRecord(
                    station_id=station.id,
                    fuel_type_id=fuel_type.id,
                    price=price,
                    currency="EUR",
                    source=CURRENT_SOURCE,
                    recorded_at=HISTORY_END,
                    is_current=True,
                )
            )

    db.commit()


def seed_historical_price_records(db: Session) -> None:
    station_map = {station.name: station for station in db.query(Station).all()}
    fuel_type_map = {
        fuel_type.code: fuel_type
        for fuel_type in db.query(FuelType).all()
    }
    existing_history_keys = {
        (
            price_record.station_id,
            price_record.fuel_type_id,
            price_record.recorded_at.date(),
        )
        for price_record in db.query(PriceRecord)
        .filter(PriceRecord.source == HISTORY_SOURCE)
        .all()
    }

    records_to_add = []

    for station_index, station_data in enumerate(STATIONS):
        station = station_map.get(station_data["name"])

        if not station:
            continue

        for fuel_type_code in station_data["fuels"]:
            fuel_type = fuel_type_map.get(fuel_type_code)

            if not fuel_type:
                continue

            for recorded_at in iter_history_dates():
                record_key = (
                    station.id,
                    fuel_type.id,
                    recorded_at.date(),
                )

                if record_key in existing_history_keys:
                    continue

                records_to_add.append(
                    PriceRecord(
                        station_id=station.id,
                        fuel_type_id=fuel_type.id,
                        price=calculate_demo_price(
                            fuel_type_code=fuel_type_code,
                            brand=station_data["brand"],
                            station_index=station_index,
                            record_date=recorded_at,
                        ),
                        currency="EUR",
                        source=HISTORY_SOURCE,
                        recorded_at=recorded_at,
                        is_current=False,
                    )
                )

    db.add_all(records_to_add)
    db.commit()


def iter_history_dates() -> list[datetime]:
    history_dates = []
    recorded_at = HISTORY_START

    while recorded_at <= HISTORY_END:
        history_dates.append(recorded_at)
        recorded_at += timedelta(days=1)

    return history_dates


def calculate_demo_price(
    fuel_type_code: str,
    brand: str,
    station_index: int,
    record_date: datetime,
) -> float:
    day_index = (record_date - HISTORY_START).days
    yearly_progress = day_index / max((HISTORY_END - HISTORY_START).days, 1)
    base_price = BASE_PRICES[fuel_type_code]

    price = base_price
    price += BRAND_MODIFIERS[brand]
    price += ((station_index % 7) - 3) * 0.004
    price += yearly_progress * 0.035
    price += sin(day_index / 17.0 + station_index) * 0.012
    price += sin(day_index / 43.0 + station_index * 0.7) * 0.018
    price += monthly_event_modifier(fuel_type_code, record_date)
    price += deterministic_noise(fuel_type_code, brand, station_index, day_index)

    return round(max(price, FUEL_MINIMUMS[fuel_type_code]), 3)


def monthly_event_modifier(fuel_type_code: str, record_date: datetime) -> float:
    month_key = record_date.strftime("%Y-%m")
    fuel_is_diesel = fuel_type_code in {"diesel", "diesel_plus"}
    fuel_is_petrol = fuel_type_code in {"petrol95", "petrol98"}

    modifier = 0.0

    if month_key == "2025-07":
        modifier += 0.035 if fuel_type_code != "lpg" else 0.018
    elif month_key == "2025-09":
        modifier -= 0.030 if fuel_type_code != "lpg" else 0.012
    elif month_key == "2025-11" and fuel_is_diesel:
        modifier += 0.055
    elif month_key == "2026-01":
        modifier += 0.035 if fuel_is_diesel else 0.018
    elif month_key == "2026-03":
        modifier += 0.050 if fuel_type_code != "lpg" else 0.030
    elif month_key == "2026-04":
        if fuel_is_diesel:
            modifier += 0.135
        elif fuel_is_petrol:
            modifier += 0.125
        else:
            modifier += 0.085
    elif month_key == "2026-05":
        modifier += 0.095 if fuel_type_code != "lpg" else 0.060
    elif month_key == "2026-06":
        modifier += 0.105 if fuel_type_code != "lpg" else 0.065

    if fuel_type_code == "diesel_plus":
        modifier += 0.006
    elif fuel_type_code == "petrol98":
        modifier += 0.010

    return modifier


def deterministic_noise(
    fuel_type_code: str,
    brand: str,
    station_index: int,
    day_index: int,
) -> float:
    seed = sum(ord(char) for char in f"{fuel_type_code}:{brand}")
    mixed = (seed + station_index * 31 + day_index * 17) % 23
    return (mixed - 11) * 0.0015


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
        print("Current price records seeded.")
        seed_historical_price_records(db)
        print("Historical price records seeded.")
        print("Database seed finished.")


if __name__ == "__main__":
    seed_database()
