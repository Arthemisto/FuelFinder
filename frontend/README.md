# FuelFinder Frontend

FuelFinder frontend is a React + TypeScript + Vite application.

It provides the user interface for:
- nearby fuel station search;
- ranked search results;
- interactive map view;
- fuel price history and forecast analytics;
- all stations list with filters.

## Local Development

Install dependencies:

```powershell
npm install
```

Run Vite dev server:

```powershell
npm run dev
```

Default local URL:

```text
http://localhost:5173
```

In dev mode the frontend uses Vite and reads API configuration from frontend
environment variables when needed.

## Production Build

Build static frontend files:

```powershell
npm run build
```

Build output:

```text
frontend/dist/
```

## Docker Image

The frontend Docker image builds the Vite app and serves `dist/` with Nginx.

Build image:

```powershell
docker build -t fuelfinder-frontend ./frontend
```

Run image manually against a backend running on the host machine:

```powershell
docker run --rm --name fuelfinder-frontend-local -p 8080:80 `
  -e BACKEND_UPSTREAM="host.docker.internal:8000" `
  fuelfinder-frontend
```

Open:

```text
http://127.0.0.1:8080
```

## API Proxy

Production frontend uses relative API calls:

```text
/api/...
```

Nginx proxies these requests to the backend through:

```text
BACKEND_UPSTREAM
```

This keeps the browser on one origin and avoids hardcoding backend URLs into the
compiled frontend bundle.

## Docker Compose

From the project root, Docker Compose starts:
- frontend container;
- backend container;
- Oracle Docker or Oracle Autonomous Database through backend configuration.

Run:

```powershell
docker compose --env-file .env.compose up --build
```

Open:

```text
http://127.0.0.1:8080
```

Quick API smoke check through Nginx:

```powershell
Invoke-RestMethod http://127.0.0.1:8080/api/status
```

## HTTPS Deployment

The verified public deployment uses:

```text
https://fuelfinder.duckdns.org
```

Deployment flow:

```text
Browser
  -> Caddy HTTPS proxy on OCI VM
  -> frontend Nginx container on host port 8080
  -> /api proxy to backend container
  -> Oracle Autonomous Database
```

The Caddy config is stored in:

```text
deploy/Caddyfile
```

Browser geolocation requires HTTPS on public deployments. The HTTPS deployment
therefore supports `Use current location`, while plain `http://<public-ip>` does
not.

## Current UI Notes

- Search starts from the locked default center `Riga, Latvia`.
- `Use current location` can replace the default coordinates when browser
  geolocation is allowed over HTTPS.
- Results and station lists display backend `recorded_at` price timestamps.
- Analytics history filtering is handled on the frontend.
- Forecast data is marked as demo algorithm output, not a real market promise.
