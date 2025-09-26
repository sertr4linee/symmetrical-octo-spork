from fastapi import APIRouter
from src.api.projects import router as projects_router
from src.api.images import router as images_router
from src.api.health import router as health_router
from src.api.filters import router as filters_router

api_router = APIRouter()

api_router.include_router(
    health_router,
    prefix="/health",
    tags=["Health"]
)

api_router.include_router(
    projects_router,
    prefix="/projects",
    tags=["Projects"]
)

api_router.include_router(
    images_router,
    prefix="/images", 
    tags=["Images"]
)

api_router.include_router(
    filters_router,
    tags=["Image Filters"]
)
