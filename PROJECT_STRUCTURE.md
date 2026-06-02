# FuelFinderNew Project Structure

## Purpose

FuelFinderNew is the current full-stack version of Fuel Finder.

The project is built around:
- React + Vite frontend;
- FastAPI backend;
- SQLAlchemy models and repositories;
- SQLite local/demo database;
- verified Oracle Database in Docker support;
- Dockerized backend and frontend services;
- Docker Compose app stack with an external Oracle container.

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
- shared app shell, navigation, status panel, and page layout;
- backend API client in `frontend/src/api/fuelFinderApi.ts`;
- station/search/map/results/status/analytics loading from backend APIs;
- `recorded_at` displayed for current station prices;
- locked default Riga center search with optional browser current location;
- analytics history range controls and fuel filtering on the frontend;
- algorithmic forecast warning/disclaimer in the UI;
- Leaflet/OpenStreetMap map using backend station coordinates;
- FastAPI backend with route/service/repository structure;
- SQLite database setup;
- Oracle Database in Docker verified locally;
- `oracledb` driver support;
- Oracle-compatible SQLAlchemy models;
- deterministic synthetic demo seed data;
- backend tests for API endpoints, distance calculation, and forecast calculation;
- latest verified backend test run: `26 passed`;
- backend Docker image;
- frontend Docker image served by Nginx;
- Nginx `/api` reverse proxy to backend;
- Docker Compose stack for frontend + backend with external Oracle.

Current limitations:
- manual address/geocoding search is not implemented;
- default search uses fixed Riga center coordinates unless current location is selected;
- demo data is synthetic, not real pump-price history;
- `lastImportStatus` exists in the API schema but is not used in the public UI;
- Alembic migrations are not configured yet;
- Oracle Autonomous Database cloud setup is still future work.

## Runtime Data Flow

Development flow:

```text
React dev server
  -> frontend API client
  -> FastAPI backend
  -> database
```

Production/container flow:

```text
Browser
  -> Nginx frontend container
  -> /api reverse proxy
  -> FastAPI backend container
  -> Oracle Docker database
```

Database modes:

```text
SQLite local/demo: backend/data/fuelfinder.db
Oracle local: external Docker container oraxe
Future cloud: Oracle Autonomous Database
```

## Frontend Structure

```text
frontend/
  Dockerfile
  nginx.conf.template
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
- `SearchPage` uses default Riga center or browser current location.
- `ResultsPage` shows ranked station results from backend APIs.
- `MapPage` shows backend station coordinates on Leaflet/OpenStreetMap.
- `AnalyticsPage` shows backend history and forecast data, with local UI filters.
- `StationsPage` shows backend station data with filters.

Frontend production behavior:
- Vite builds static assets into `dist`;
- Nginx serves the static frontend;
- Nginx proxies `/api` to the backend through `BACKEND_UPSTREAM`;
- production frontend uses relative `/api` requests.

## Backend Structure

```text
backend/
  Dockerfile
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
- jobs seed database data.

## Docker/Compose Structure

```text
docker-compose.yml
.env.compose.example
.env.compose          local only, ignored by git
backend/Dockerfile
backend/.dockerignore
frontend/Dockerfile
frontend/.dockerignore
frontend/nginx.conf.template
```

Compose services:

```text
frontend -> Nginx + React build on localhost:8080
backend  -> FastAPI on localhost:8000
Oracle   -> external container oraxe on localhost:1521
```

Inside Compose, frontend proxies to:

```text
backend:8000
```

The backend connects to external Oracle through:

```text
host.docker.internal:1521
```

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

Current price responses include `recorded_at` so the frontend can show update
dates instead of a live-data placeholder.

## Important Commands

Backend tests:

```powershell
python -m pytest
```

Seed the configured database:

```powershell
python -m app.jobs.seed_database
```

Run backend locally:

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Run frontend locally:

```powershell
npm run dev
```

Build frontend:

```powershell
npm run build
```

Run full Docker app stack:

```powershell
docker compose --env-file .env.compose up --build
```

Check through frontend Nginx proxy:

```powershell
Invoke-RestMethod http://127.0.0.1:8080/api/status
```

## Verified State

Verified locally:
- SQLite seed and tests;
- Oracle Docker seed and tests;
- frontend build;
- backend Docker container -> Oracle Docker;
- frontend Docker container -> Nginx `/api` proxy -> backend;
- Docker Compose frontend + backend with external Oracle.

Latest backend test result:

```text
26 passed
```

## Next Project Target

The next major checkpoint is cloud preparation.

Planned next steps:
1. Update runbook/docs for Docker Compose and deployment.
2. Prepare OCI VM deployment checklist.
3. Install Docker on OCI VM.
4. Clone/pull project on VM.
5. Create `.env.compose` on VM without committing secrets.
6. Run Docker Compose in detached mode.
7. Smoke test through the VM public IP.
8. Later connect to Oracle Autonomous Database.
