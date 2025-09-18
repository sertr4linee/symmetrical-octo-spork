"""
Endpoints pour la gestion des projets Better GIMP
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from uuid import uuid4
from datetime import datetime

from models.project import Project, ProjectCreate, ProjectUpdate
from services.project_service import ProjectService

router = APIRouter()


@router.get("/", response_model=List[Project])
async def list_projects(
    skip: int = 0,
    limit: int = 100,
    project_service: ProjectService = Depends()
):
    """Lister tous les projets"""
    return await project_service.get_projects(skip=skip, limit=limit)


@router.post("/", response_model=Project)
async def create_project(
    project_data: ProjectCreate,
    project_service: ProjectService = Depends()
):
    """Créer un nouveau projet"""
    return await project_service.create_project(project_data)


@router.get("/{project_id}", response_model=Project)
async def get_project(
    project_id: str,
    project_service: ProjectService = Depends()
):
    """Obtenir un projet par son ID"""
    project = await project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.put("/{project_id}", response_model=Project)
async def update_project(
    project_id: str,
    project_data: ProjectUpdate,
    project_service: ProjectService = Depends()
):
    """Mettre à jour un projet"""
    project = await project_service.update_project(project_id, project_data)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    project_service: ProjectService = Depends()
):
    """Supprimer un projet"""
    success = await project_service.delete_project(project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully"}


@router.get("/{project_id}/images")
async def get_project_images(
    project_id: str,
    project_service: ProjectService = Depends()
):
    """Obtenir toutes les images d'un projet"""
    images = await project_service.get_project_images(project_id)
    return {"project_id": project_id, "images": images}
