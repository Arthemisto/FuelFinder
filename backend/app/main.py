from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes.analytics_routes import router as analytics_router
from app.routes.fuel_type_routes import router as fuel_type_router
from app.routes.health_routes import router as health_router
from app.routes.search_routes import router as search_router
from app.routes.station_routes import router as station_router
from app.routes.status_routes import router as status_router

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(status_router)
app.include_router(fuel_type_router)
app.include_router(station_router)
app.include_router(search_router)
app.include_router(analytics_router)