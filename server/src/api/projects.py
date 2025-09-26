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
    return await project_service.get_projects(skip=skip, limit=limit)


@router.post("/", response_model=Project)
async def create_project(
    project_data: ProjectCreate,
    project_service: ProjectService = Depends()
):
    return await project_service.create_project(project_data)


@router.get("/{project_id}", response_model=Project)
async def get_project(
    project_id: str,
    project_service: ProjectService = Depends()
):
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
    project = await project_service.update_project(project_id, project_data)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    project_service: ProjectService = Depends()
):
    success = await project_service.delete_project(project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully"}


@router.get("/{project_id}/images")
async def get_project_images(
    project_id: str,
    project_service: ProjectService = Depends()
):
    images = await project_service.get_project_images(project_id)
    return {"project_id": project_id, "images": images}


@router.post("/{project_id}/images")
async def upload_image_to_project(
    project_id: str,
    image_data: dict,  # Will contain: name, data (base64), size, type, etc.
    project_service: ProjectService = Depends()
):
    """Upload an image to a specific project"""
    try:
        # Verify project exists
        project = await project_service.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Upload image to project
        image = await project_service.add_image_to_project(project_id, image_data)
        return image
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")


@router.put("/{project_id}/canvas")
async def save_canvas_data(
    project_id: str,
    canvas_data: dict,  # Will contain: canvas_json (string)
    project_service: ProjectService = Depends()
):
    """Save canvas state for a project"""
    try:
        # Verify project exists
        project = await project_service.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        canvas_json = canvas_data.get('canvas_json', '')
        if not canvas_json:
            raise HTTPException(status_code=400, detail="canvas_json is required")
        
        success = await project_service.save_canvas_data(project_id, canvas_json)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to save canvas data")
        
        return {"message": "Canvas data saved successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save canvas: {str(e)}")
