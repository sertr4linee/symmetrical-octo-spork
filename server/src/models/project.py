from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import uuid4


class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Nom du projet")
    description: Optional[str] = Field(None, max_length=1000, description="Description du projet")
    width: int = Field(..., gt=0, description="Largeur du canvas en pixels")
    height: int = Field(..., gt=0, description="Hauteur du canvas en pixels")
    color_mode: str = Field(default="RGB", description="Mode colorimétrique (RGB, CMYK, etc.)")
    resolution: int = Field(default=300, gt=0, description="Résolution en DPI")
    canvas_state: Optional[str] = Field(None, description="État sérialisé du canvas (JSON)")


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    width: Optional[int] = Field(None, gt=0)
    height: Optional[int] = Field(None, gt=0)
    color_mode: Optional[str] = None
    resolution: Optional[int] = Field(None, gt=0)
    canvas_state: Optional[str] = Field(None, description="État sérialisé du canvas (JSON)")


class Project(ProjectBase):
    id: str = Field(default_factory=lambda: str(uuid4()), description="Identifiant unique du projet")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Date de création")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Date de dernière modification")
    image_count: int = Field(default=0, description="Nombre d'images dans le projet")
    file_size: int = Field(default=0, description="Taille totale du projet en bytes")
    canvas_state: Optional[str] = Field(None, description="État sérialisé du canvas (JSON)")
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "name": "Mon Projet Photo",
                "description": "Retouche photos de vacances",
                "width": 1920,
                "height": 1080,
                "color_mode": "RGB",
                "resolution": 300,
                "created_at": "2024-01-15T10:30:00",
                "updated_at": "2024-01-15T15:45:00",
                "image_count": 5,
                "file_size": 25600000
            }
        }


class ProjectSummary(BaseModel):
    id: str
    name: str
    description: Optional[str]
    created_at: datetime
    updated_at: datetime
    image_count: int
    file_size: int
