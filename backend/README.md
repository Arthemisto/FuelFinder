# FuelFinder Backend Runbook

## Purpose

This runbook is the short operational guide for running the FuelFinder backend
locally with either SQLite or Oracle Database in Docker.

The backend uses one code path for both databases. The active database is chosen
through `DATABASE_URL` in `backend/.env`.

Do not commit `backend/.env`; it can contain real credentials.

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
Price records seeded.
Historical price records seeded.
Database seed finished.
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
25 passed
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
3
```

## Frontend Pairing

The frontend does not care whether the backend uses SQLite or Oracle. It only
needs the backend URL.

Default backend URL used by the frontend:

```text
http://127.0.0.1:8000
```

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

The next infrastructure checkpoint is to package the app services:

1. Add a backend Dockerfile.
2. Build the frontend for production.
3. Serve frontend assets through Nginx or another static server.
4. Add docker-compose for backend/frontend while keeping Oracle as an external
   database target first.
5. Later prepare Oracle Autonomous Database configuration.
