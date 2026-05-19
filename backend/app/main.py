from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.config import get_settings
from app.db.session import init_db
from app.schemas.health import HealthResponse

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.environment == "development":
        await init_db()
    yield


app = FastAPI(
    title="Tazarzit Bio API",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_prefix)


@app.get("/health", response_model=HealthResponse, tags=["health"])
async def root_health() -> HealthResponse:
    """Load-balancer health check (same payload as /api/v1/health)."""
    from app.api.v1.health import health_check

    return await health_check()
