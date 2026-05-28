from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_endpoint_returns_ok() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_status_endpoint_returns_backend_and_database_status() -> None:
    response = client.get("/api/status")

    assert response.status_code == 200

    data = response.json()
    assert data["backendStatus"] == "online"
    assert data["databaseStatus"] in ["connected", "disconnected"]
    assert "version" in data
    assert "environment" in data


def test_fuel_types_endpoint_returns_list() -> None:
    response = client.get("/api/fuel-types")

    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)


def test_stations_endpoint_returns_list() -> None:
    response = client.get("/api/stations")

    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)


def test_station_details_endpoint_returns_station() -> None:
    response = client.get("/api/stations/1")

    assert response.status_code == 200

    data = response.json()
    assert data["id"] == 1
    assert "fuels" in data


def test_station_details_endpoint_returns_404_for_missing_station() -> None:
    response = client.get("/api/stations/9999")

    assert response.status_code == 404
    assert response.json() == {"detail": "Station not found"}