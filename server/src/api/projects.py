from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from uuid import uuid4
from datetime import datetime

from src.models.project import Project, ProjectCreate, ProjectUpdate
from src.services.project_service import ProjectService

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
    image_data: dict,
    project_service: ProjectService = Depends()
):
    try:
        project = await project_service.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        image = await project_service.add_image_to_project(project_id, image_data)
        return image
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")


@router.get("/{project_id}/export")
async def export_project(
    project_id: str,
    format: Optional[str] = "json",
    project_service: ProjectService = Depends()
):
    try:
        project = await project_service.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Get all project images
        images = await project_service.get_project_images(project_id)
        
        # Create export data
        export_data = {
            "project": {
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "width": project.width,
                "height": project.height,
                "color_mode": project.color_mode,
                "resolution": project.resolution,
                "canvas_state": project.canvas_state,
                "created_at": project.created_at.isoformat(),
                "updated_at": project.updated_at.isoformat()
            },
            "images": images,
            "export_format": format,
            "export_date": datetime.now().isoformat(),
            "version": "1.0.0"
        }
        
        return {
            "success": True,
            "export_data": export_data,
            "filename": f"{project.name.replace(' ', '_')}_export.json"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export project: {str(e)}")


@router.post("/import")
async def import_project(
    project_data: dict,
    project_service: ProjectService = Depends()
):
    try:
        # Extract project information from import data
        if "project" not in project_data:
            raise ValueError("Invalid project data format")
        
        project_info = project_data["project"]
        
        # Create new project from imported data
        new_project_data = ProjectCreate(
            name=f"Imported - {project_info.get('name', 'Untitled')}",
            description=project_info.get('description', 'Imported project'),
            width=project_info.get('width', 800),
            height=project_info.get('height', 600),
            color_mode=project_info.get('color_mode', 'RGB'),
            resolution=project_info.get('resolution', 72),
            canvas_state=project_info.get('canvas_state')
        )
        
        # Create the project
        imported_project = await project_service.create_project(new_project_data)
        
        # Import images if any
        imported_images = []
        if "images" in project_data and project_data["images"]:
            for image_data in project_data["images"]:
                try:
                    image = await project_service.add_image_to_project(imported_project.id, image_data)
                    imported_images.append(image)
                except Exception as e:
                    print(f"Failed to import image: {e}")
        
        return {
            "success": True,
            "project": imported_project,
            "imported_images_count": len(imported_images),
            "message": "Project imported successfully"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to import project: {str(e)}")
