# FuelFinderNew Project Structure

## Purpose

FuelFinderNew is the current full-stack version of Fuel Finder.

The project is built around:
- React + Vite frontend;
- FastAPI backend;
- SQLAlchemy models and repositories;
- SQLite local/demo database;
- Oracle Database as the next local Docker target.

The backend is the runtime source of truth for:
- fuel types;
- stations;
- station prices;
- search results;
- analytics history;
- forecast data;
- backend/database status.

Frontend mock station data has been removed from the runtime flow.

## Current Status

Implemented:
- React frontend with 5 main pages;
- shared app shell, navigation, header, and status panel;
- backend API client in `frontend/src/api/fuelFinderApi.ts`;
- backend station, fuel type, search, status, analytics, and forecast loading;
- Leaflet/OpenStreetMap map using backend station coordinates;
- browser current-location support for radius search;
- FastAPI backend with layered route/service/repository structure;
- SQLite database setup;
- seed job for pseudo/demo data;
- SQLAlchemy models for stations, fuel types, station fuel availability, and price records;
- backend tests for API endpoints, distance calculation, and forecast calculation.

Current limitations:
- manual location text is not geocoded;
- radius filtering is only applied when browser coordinates are available;
- demo data is still seeded from local pseudo-data;
- `lastImportStatus` exists in the API schema but is not used in the public UI;
- Oracle Docker database has not been verified yet;
- Alembic migrations are not configured yet.

## Runtime Data Flow

```text
React frontend
  -> frontend API client
  -> FastAPI routes
  -> service layer
  -> repository layer
  -> database
```

Local/demo mode:

```text
SQLite database at backend/data/fuelfinder.db
```

Next target:

```text
Oracle Database in Docker
```

Later target:

```text
Oracle Autonomous Database
```

## Frontend Structure

```text
frontend/
  src/
    api/
      fuelFinderApi.ts
    components/
      layout/
      shared/
    pages/
      SearchPage.tsx
      ResultsPage.tsx
      MapPage.tsx
      AnalyticsPage.tsx
      StationsPage.tsx
    types/
      page.ts
      search.ts
      station.ts
```

Main pages:
- `SearchPage` collects location, radius, and fuel type.
- `ResultsPage` shows ranked station results from backend APIs.
- `MapPage` shows backend station coordinates on Leaflet/OpenStreetMap.
- `AnalyticsPage` shows backend history and backend forecast data.
- `StationsPage` shows backend station data with filters.

## Backend Structure

```text
backend/
  app/
    main.py
    config.py
    database.py
    algorithms/
    jobs/
    models/
    repositories/
    routes/
    schemas/
    services/
  data/
    fuelfinder.db
  tests/
  requirements.txt
  .env.example
```

Main backend layers:
- routes receive HTTP requests and return response schemas;
- services coordinate business logic;
- repositories hide SQLAlchemy queries;
- models define database tables;
- algorithms hold pure calculation logic;
- jobs seed or prepare database data.

## Current Database Tables

```text
stations
fuel_types
station_fuel_types
price_records
```

### stations

Stores active fuel stations:
- name;
- brand;
- address;
- city;
- latitude;
- longitude;
- active flag;
- timestamps.

### fuel_types

Stores supported fuel types:
- diesel;
- petrol95;
- petrol98;
- lpg;
- diesel_plus;
- electric.

### station_fuel_types

Connects stations with available fuel types.

### price_records

Stores current and historical prices:
- station;
- fuel type;
- price;
- currency;
- source;
- recorded timestamp;
- current flag.

## API Endpoints

Implemented:

```text
GET /health
GET /api/status
GET /api/fuel-types
GET /api/stations
GET /api/stations/{station_id}
GET /api/stations/filters
GET /api/search
GET /api/analytics/fuel-trends
GET /api/analytics/forecast
```

## Important Commands

Backend tests:

```powershell
cd backend
python -m pytest
```

Seed local/demo database:

```powershell
cd backend
python -m app.jobs.seed_database
```

Run backend:

```powershell
cd backend
python -m uvicorn app.main:app --reload
```

Run frontend:

```powershell
cd frontend
npm run dev
```

Build frontend:

```powershell
cd frontend
npm run build
```

If PowerShell blocks `npm.ps1`, use:

```powershell
npm.cmd run dev
npm.cmd run build
```

## Next Project Target

The next major checkpoint is to verify the existing database-backed application
against Oracle Database running in Docker.

Planned next steps:
1. Add Oracle driver dependency and environment example.
2. Keep SQLite as the default local/demo mode.
3. Configure `DATABASE_URL` for Oracle Docker.
4. Run backend database connection check against Oracle.
5. Run `seed_database` against Oracle.
6. Verify API endpoints read Oracle data.
7. Verify frontend works through the same backend API.
8. Update deployment notes after the Oracle Docker test is stable.
