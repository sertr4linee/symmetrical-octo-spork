from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import uuid4
from enum import Enum


class ImageFormat(str, Enum):
    JPEG = "jpeg"
    PNG = "png"
    TIFF = "tiff"
    WEBP = "webp"
    BMP = "bmp"


class ProcessingOperation(str, Enum):
    BRIGHTNESS = "brightness"
    CONTRAST = "contrast"
    BRIGHTNESS_CONTRAST = "brightness_contrast"
    GAUSSIAN_BLUR = "gaussian_blur"
    UNSHARP_MASK = "unsharp_mask"
    RESIZE = "resize"
    ROTATE = "rotate"
    CONVERT_COLOR_SPACE = "convert_color_space"


class ImageBase(BaseModel):
    filename: str = Field(..., min_length=1, description="Nom du fichier")
    content_type: str = Field(..., description="Type MIME de l'image")
    project_id: Optional[str] = Field(None, description="ID du projet parent")


class ImageCreate(ImageBase):
    data: bytes = Field(..., description="Données binaires de l'image")


class ImageImport(BaseModel):
    name: str = Field(..., description="Nom du fichier")
    project_id: str = Field(..., description="ID du projet")
    format: str = Field(..., description="Format de l'image")
    width: int = Field(..., description="Largeur en pixels")
    height: int = Field(..., description="Hauteur en pixels")
    size: int = Field(..., description="Taille du fichier en bytes")


class ImageProcess(BaseModel):
    operation: ProcessingOperation = Field(..., description="Type d'opération à effectuer")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Paramètres de l'opération")
    
    class Config:
        json_schema_extra = {
            "example": {
                "operation": "brightness_contrast",
                "parameters": {
                    "brightness": 10.0,
                    "contrast": 5.0
                }
            }
        }


class Image(ImageBase):
    id: str = Field(default_factory=lambda: str(uuid4()), description="Identifiant unique")
    width: Optional[int] = Field(None, description="Largeur en pixels")
    height: Optional[int] = Field(None, description="Hauteur en pixels")
    channels: Optional[int] = Field(None, description="Nombre de canaux")
    color_mode: Optional[str] = Field(None, description="Mode colorimétrique")
    file_size: int = Field(default=0, description="Taille du fichier en bytes")
    checksum: Optional[str] = Field(None, description="Somme de contrôle MD5")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Date de création")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Date de modification")
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440001",
                "filename": "photo.jpg",
                "content_type": "image/jpeg",
                "project_id": "550e8400-e29b-41d4-a716-446655440000",
                "width": 1920,
                "height": 1080,
                "channels": 3,
                "color_mode": "RGB",
                "file_size": 1024000,
                "checksum": "5d41402abc4b2a76b9719d911017c592",
                "created_at": "2024-01-15T10:30:00",
                "updated_at": "2024-01-15T15:45:00"
            }
        }


class ImageHistory(BaseModel):
    id: str
    image_id: str
    operation: str
    parameters: Dict[str, Any]
    timestamp: datetime
    user_id: Optional[str] = None


class ImageMetadata(BaseModel):
    exif: Optional[Dict[str, Any]] = None
    color_profile: Optional[str] = None
    dpi: Optional[int] = None
    gamma: Optional[float] = None
