# FuelFinder Backend Runbook

## Purpose

This runbook is the short operational guide for running the FuelFinder backend
locally with either SQLite or Oracle Database in Docker.

The backend uses one code path for both databases. The active database is chosen
through `DATABASE_URL` in `backend/.env`.

Do not commit `backend/.env`; it can contain real credentials.

For the full app container stack, use the root-level Docker Compose files:

```text
docker-compose.yml
.env.compose.example
.env.compose local only
```

## Environment Files

Use `backend/.env.example` as the template:

```powershell
Copy-Item .env.example .env
```

Then choose one database mode in `.env`.

### SQLite Mode

Use this for lightweight local/demo work:

```env
APP_NAME=FuelFinder API
APP_VERSION=1.0.0
ENVIRONMENT=local

DATABASE_URL=sqlite:///./data/fuelfinder.db

CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

SQLite stores data in:

```text
backend/data/fuelfinder.db
```

### Oracle Docker Mode

Use this for the verified Oracle local setup:

```env
APP_NAME=FuelFinder API
APP_VERSION=1.0.0
ENVIRONMENT=oracle-local

DATABASE_URL=oracle+oracledb://FUELFINDER:your_password@localhost:1521/?service_name=XEPDB1

CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Verified local Oracle image:

```text
gvenzl/oracle-xe:21-slim
```

Typical container ports:

```text
localhost:1521 -> Oracle listener
localhost:5500 -> Oracle Enterprise Manager
```

## Install Dependencies

From `backend/`:

```powershell
python -m pip install -r requirements.txt
```

Oracle support requires:

```text
oracledb
```

## Verify Active Configuration

From `backend/`:

```powershell
python -c "from app.config import settings; print(settings.environment); print(settings.database_url)"
```

Expected SQLite example:

```text
local
sqlite:///./data/fuelfinder.db
```

Expected Oracle example:

```text
oracle-local
oracle+oracledb://...
```

## Seed Database

The seed job creates tables and inserts demo data into the currently configured
database.

From `backend/`:

```powershell
python -m app.jobs.seed_database
```

Expected output:

```text
Database seed started.
Fuel types seeded.
Stations seeded.
Station fuel types seeded.
Current price records seeded.
Historical price records seeded.
Database seed finished.
```

Current demo seed shape:

```text
25 stations
32208 historical demo records
0 electric price records
```

## Run Backend

From `backend/`:

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Health check:

```text
http://127.0.0.1:8000/health
```

API docs:

```text
http://127.0.0.1:8000/docs
```

Status check:

```text
http://127.0.0.1:8000/api/status
```

For Oracle mode, the status response should include:

```json
{
  "databaseStatus": "connected",
  "environment": "oracle-local"
}
```

## Run Tests

Tests use whichever database is active in `backend/.env`.

From `backend/`:

```powershell
python -m pytest
```

Latest verified result:

```text
26 passed
```

Both SQLite mode and Oracle Docker mode have been verified with the same test
suite.

## Useful Smoke Checks

From `backend/`:

```powershell
python -c "from fastapi.testclient import TestClient; from app.main import app; client = TestClient(app); print(client.get('/api/status').json())"
```

```powershell
python -c "from fastapi.testclient import TestClient; from app.main import app; client = TestClient(app); r = client.get('/api/search', params={'latitude': 56.9496, 'longitude': 24.1052, 'radius_km': 10, 'fuel_type': 'diesel'}); print(r.status_code); print(len(r.json()['stations']))"
```

Expected search smoke result:

```text
200
```

The station count depends on radius, active database seed state, and selected
fuel type.

## Frontend Pairing

The frontend does not care whether the backend uses SQLite or Oracle. It only
needs an API path.

Default backend URL used by the frontend:

```text
http://127.0.0.1:8000
```

Production container mode uses relative `/api` requests and lets Nginx proxy
them to the backend.

Frontend commands from `frontend/`:

```powershell
npm run build
npm run dev
```

If PowerShell blocks `npm.ps1`, use:

```powershell
npm.cmd run build
npm.cmd run dev
```

## Backend Docker

Build backend image from the project root:

```powershell
docker build -t fuelfinder-backend ./backend
```

Run backend container against local Oracle Docker:

```powershell
docker run --rm --name fuelfinder-backend-local -p 8000:8000 `
  -e APP_NAME="FuelFinder API" `
  -e APP_VERSION="1.0.0" `
  -e ENVIRONMENT="oracle-local-docker-backend" `
  -e DATABASE_URL="oracle+oracledb://FUELFINDER:your_password@host.docker.internal:1521/?service_name=XEPDB1" `
  -e CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://127.0.0.1:8080" `
  fuelfinder-backend
```

Check:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/status
```

## Frontend Docker

Build frontend image from the project root:

```powershell
docker build -t fuelfinder-frontend ./frontend
```

Run frontend container manually with Nginx `/api` proxy:

```powershell
docker run --rm --name fuelfinder-frontend-local -p 8080:80 `
  -e BACKEND_UPSTREAM="host.docker.internal:8000" `
  fuelfinder-frontend
```

Open:

```text
http://127.0.0.1:8080
```

Check proxy:

```powershell
Invoke-RestMethod http://127.0.0.1:8080/api/status
```

## Docker Compose App Stack

The root-level Compose stack runs:

```text
frontend container
backend container
external Oracle Docker container oraxe
```

Create local `.env.compose` from `.env.compose.example` and fill the real
Oracle password. Do not commit `.env.compose`.

Run:

```powershell
docker compose --env-file .env.compose up --build
```

Run in background:

```powershell
docker compose --env-file .env.compose up --build -d
```

Stop:

```powershell
docker compose down
```

Smoke check through frontend Nginx:

```powershell
Invoke-RestMethod http://127.0.0.1:8080/api/status
```

Open:

```text
http://127.0.0.1:8080
```

## Oracle Compatibility Notes

The codebase includes small compatibility choices so the same backend works with
SQLite and Oracle:

- primary keys use SQLAlchemy `Identity()`;
- primary key columns do not add redundant `index=True`;
- boolean query filters use SQLAlchemy equality expressions;
- database health checks use `SELECT 1 FROM DUAL` for Oracle;
- analytics date grouping is handled in Python instead of database-specific
  date SQL.

## Next Deployment Work

The next infrastructure checkpoint is cloud preparation:

1. Prepare Oracle Cloud VM.
2. Install Docker and Docker Compose.
3. Clone/pull the project.
4. Create `.env.compose` on the VM.
5. Run Compose in detached mode.
6. Smoke test through the VM public IP.
7. Later prepare Oracle Autonomous Database configuration.
