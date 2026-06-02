from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from app.config import settings


def get_connect_args() -> dict[str, str | bool]:
    if settings.database_url.startswith("sqlite"):
        return {"check_same_thread": False}

    if (
        settings.database_url.startswith("oracle")
        and settings.oracle_wallet_location
    ):
        connect_args: dict[str, str | bool] = {
            "config_dir": settings.oracle_wallet_location,
            "wallet_location": settings.oracle_wallet_location,
        }

        if settings.oracle_wallet_password:
            connect_args["wallet_password"] = settings.oracle_wallet_password

        return connect_args

    return {}


engine = create_engine(
    settings.database_url,
    connect_args=get_connect_args(),
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def check_database_connection() -> bool:
    try:
        health_query = (
            "SELECT 1 FROM DUAL"
            if settings.database_url.startswith("oracle")
            else "SELECT 1"
        )

        with engine.connect() as connection:
            connection.execute(text(health_query))

        return True
    except Exception:
        return False


def create_database_tables() -> None:
    import app.models

    Base.metadata.create_all(bind=engine)