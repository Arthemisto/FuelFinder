# FuelFinderNew Project Structure

## Purpose

FuelFinderNew is the current full-stack version of Fuel Finder.

The project is built around:
- React + Vite frontend;
- FastAPI backend;
- SQLAlchemy models and repositories;
- SQLite local/demo database;
- verified Oracle Database in Docker support;
- verified Oracle Autonomous Database cloud support;
- Dockerized backend and frontend services;
- Docker Compose app stack;
- HTTPS reverse proxy through Caddy on OCI VM.

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
- Oracle Autonomous Database wallet/mTLS connection verified;
- OCI VM deployment verified;
- DuckDNS + Caddy HTTPS proxy verified;
- public HTTPS demo URL verified.

Current limitations:
- manual address/geocoding search is not implemented;
- default search uses fixed Riga center coordinates unless current location is selected;
- demo data is synthetic, not real pump-price history;
- `lastImportStatus` exists in the API schema but is not used in the public UI;
- Alembic migrations are not configured yet;
- address search still uses fixed coordinates or browser geolocation, not a
  typed address geocoder.

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
  -> Caddy HTTPS reverse proxy
  -> Nginx frontend container
  -> /api reverse proxy
  -> FastAPI backend container
  -> Oracle Autonomous Database
```

Database modes:

```text
SQLite local/demo: backend/data/fuelfinder.db
Oracle local: external Docker container oraxe
Oracle cloud: Oracle Autonomous Database wallet/mTLS
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
backend  -> FastAPI bound to 127.0.0.1:8000 on host
Oracle   -> local Docker Oracle or Oracle Autonomous Database
Caddy    -> host HTTPS reverse proxy on 80/443
```

Inside Compose, frontend proxies to:

```text
backend:8000
```

For local Oracle Docker, the backend connects through:

```text
host.docker.internal:1521
```

For Oracle Autonomous Database, the backend uses:

```text
DATABASE_URL=oracle+oracledb://FUELFINDER:<password>@fuelfinder_low
ORACLE_WALLET_LOCATION=/opt/oracle/wallet
ORACLE_WALLET_HOST_PATH=<host wallet directory>
```

## HTTPS Deployment

Verified public deployment:

```text
https://fuelfinder.duckdns.org
```

Deployment shape:

```text
DuckDNS domain
  -> OCI VM public IP
  -> Caddy on ports 80/443
  -> frontend container on 8080
  -> Nginx /api proxy
  -> backend container
  -> Oracle Autonomous Database
```

The Caddy config is stored in:

```text
deploy/Caddyfile
```

Caddy provides:
- automatic HTTPS;
- HTTP to HTTPS redirects;
- reverse proxy to the frontend container;
- basic security headers;
- removal of upstream `Server` and `Via` response headers.

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

Verified in cloud:
- Oracle Autonomous Database wallet/mTLS connection;
- backend API smoke checks against cloud database;
- full backend test run against cloud database;
- OCI VM Docker Compose deployment;
- HTTPS public frontend through DuckDNS + Caddy.

Latest backend test result:

```text
26 passed
```

## Next Project Target

The next major checkpoint is final project reporting and hardening.

Planned next steps:
1. Update final report material and architecture diagrams.
2. Rotate exposed demo credentials/tokens before final presentation.
3. Keep `.env`, `.env.compose`, SSH keys, and wallet files out of git.
4. Optionally add a production deployment script/runbook.
5. Optionally replace DuckDNS with a owned domain.
