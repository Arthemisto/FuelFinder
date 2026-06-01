# FuelFinderNew Project Structure

## Purpose

FuelFinderNew is the current full-stack version of Fuel Finder.

The project is built around:
- React + Vite frontend;
- FastAPI backend;
- SQLAlchemy models and repositories;
- SQLite local/demo database;
- verified Oracle Database in Docker support.

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
- Oracle Database in Docker setup verified locally;
- `oracledb` driver support;
- seed job for pseudo/demo data;
- Oracle-compatible SQLAlchemy models for stations, fuel types, station fuel availability, and price records;
- backend tests for API endpoints, distance calculation, and forecast calculation;
- latest verified backend test run: `25 passed`;
- frontend build and development server verified against the Oracle-backed API.

Current limitations:
- manual location text is not geocoded;
- radius filtering is only applied when browser coordinates are available;
- demo data is still seeded from local pseudo-data;
- `lastImportStatus` exists in the API schema but is not used in the public UI;
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

Verified local Oracle mode:

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

Seed the configured database:

```powershell
cd backend
python -m app.jobs.seed_database
```

The seed job uses `DATABASE_URL`, so it can target SQLite or Oracle Docker
depending on the active `.env` file.

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

## Oracle Docker Verification

The existing database-backed application has been verified against Oracle
Database running in Docker.

Verified:
- backend connects through `DATABASE_URL`;
- `seed_database` creates and populates Oracle tables;
- API endpoints read Oracle data;
- `/api/status` reports `databaseStatus=connected` and `environment=oracle-local`;
- backend tests pass with `25 passed`;
- frontend build/dev flow works against the Oracle-backed API.

## Next Project Target

The next major checkpoint is to package or deploy the already verified app
stack.

Planned next steps:
1. Add Dockerfile for the FastAPI backend.
2. Add frontend production build serving, likely through Nginx.
3. Add docker-compose or deployment notes for backend/frontend using an external Oracle database.
4. Keep SQLite as the lightweight local/demo fallback.
5. Prepare Oracle Autonomous Database configuration after the local app deployment flow is stable.
