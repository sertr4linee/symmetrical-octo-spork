from fastapi import APIRouter
from .projects import router as projects_router
from .images import router as images_router
from .health import router as health_router

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
