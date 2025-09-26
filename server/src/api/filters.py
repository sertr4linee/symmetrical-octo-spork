from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import io
import numpy as np
from PIL import Image
import logging

from src.services.core_service import core_service
from src.services.image_service import ImageService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/filters", tags=["Image Filters"])

class GaussianBlurRequest(BaseModel):
    image_id: str = Field(..., description="ID de l'image à traiter")
    sigma: float = Field(default=1.0, ge=0.1, le=10.0, description="Écart-type du flou gaussien")

class SharpenRequest(BaseModel):
    image_id: str = Field(..., description="ID de l'image à traiter")
    strength: float = Field(default=1.0, ge=0.0, le=3.0, description="Force du filtre de netteté")

class BrightnessContrastRequest(BaseModel):
    image_id: str = Field(..., description="ID de l'image à traiter")
    brightness: float = Field(default=0.0, ge=-100.0, le=100.0, description="Ajustement de luminosité")
    contrast: float = Field(default=1.0, ge=0.1, le=3.0, description="Facteur de contraste")

class ResizeRequest(BaseModel):
    image_id: str = Field(..., description="ID de l'image à traiter")
    width: int = Field(..., gt=0, le=8192, description="Nouvelle largeur")
    height: int = Field(..., gt=0, le=8192, description="Nouvelle hauteur")
    interpolation: str = Field(default="lanczos", description="Algorithme d'interpolation")

class RotateRequest(BaseModel):
    image_id: str = Field(..., description="ID de l'image à traiter")
    angle: float = Field(..., ge=-360.0, le=360.0, description="Angle de rotation en degrés")

@router.get("/core/info")
async def get_core_info() -> Dict[str, Any]:
    return core_service.get_core_info()

@router.post("/gaussian-blur")
async def apply_gaussian_blur(
    request: GaussianBlurRequest,
    image_service: ImageService = Depends()
) -> StreamingResponse:
    try:
        db_image = await image_service.get_image(request.image_id)
        if not db_image:
            raise HTTPException(status_code=404, detail="Image not found")
        
        image_array = _bytes_to_numpy(db_image.data)
        
        filtered_array = core_service.apply_gaussian_blur(image_array, request.sigma)
        
        result_bytes = _numpy_to_bytes(filtered_array, db_image.format)
        
        return StreamingResponse(
            io.BytesIO(result_bytes), 
            media_type=f"image/{db_image.format.lower()}"
        )
        
    except Exception as e:
        logger.error(f"Error applying Gaussian blur: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sharpen")
async def apply_sharpen_filter(
    request: SharpenRequest,
    image_service: ImageService = Depends()
) -> StreamingResponse:
    try:
        db_image = await image_service.get_image(request.image_id)
        if not db_image:
            raise HTTPException(status_code=404, detail="Image not found")
        
        image_array = _bytes_to_numpy(db_image.data)
        filtered_array = core_service.apply_sharpen_filter(image_array, request.strength)
        result_bytes = _numpy_to_bytes(filtered_array, db_image.format)
        
        return StreamingResponse(
            io.BytesIO(result_bytes), 
            media_type=f"image/{db_image.format.lower()}"
        )
        
    except Exception as e:
        logger.error(f"Error applying sharpen filter: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/brightness-contrast")
async def adjust_brightness_contrast(
    request: BrightnessContrastRequest,
    image_service: ImageService = Depends()
) -> StreamingResponse:
    try:
        db_image = await image_service.get_image(request.image_id)
        if not db_image:
            raise HTTPException(status_code=404, detail="Image not found")
        
        image_array = _bytes_to_numpy(db_image.data)
        adjusted_array = core_service.adjust_brightness_contrast(
            image_array, request.brightness, request.contrast
        )
        result_bytes = _numpy_to_bytes(adjusted_array, db_image.format)
        
        return StreamingResponse(
            io.BytesIO(result_bytes), 
            media_type=f"image/{db_image.format.lower()}"
        )
        
    except Exception as e:
        logger.error(f"Error adjusting brightness/contrast: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/resize")
async def resize_image(
    request: ResizeRequest,
    image_service: ImageService = Depends()
) -> StreamingResponse:
    try:
        db_image = await image_service.get_image(request.image_id)
        if not db_image:
            raise HTTPException(status_code=404, detail="Image not found")
        
        image_array = _bytes_to_numpy(db_image.data)
        resized_array = core_service.resize_image(
            image_array, request.width, request.height, request.interpolation
        )
        result_bytes = _numpy_to_bytes(resized_array, db_image.format)
        
        return StreamingResponse(
            io.BytesIO(result_bytes), 
            media_type=f"image/{db_image.format.lower()}"
        )
        
    except Exception as e:
        logger.error(f"Error resizing image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/rotate")
async def rotate_image(
    request: RotateRequest,
    image_service: ImageService = Depends()
) -> StreamingResponse:
    try:
        db_image = await image_service.get_image(request.image_id)
        if not db_image:
            raise HTTPException(status_code=404, detail="Image not found")
        
        image_array = _bytes_to_numpy(db_image.data)
        rotated_array = core_service.rotate_image(image_array, request.angle)
        result_bytes = _numpy_to_bytes(rotated_array, db_image.format)
        
        return StreamingResponse(
            io.BytesIO(result_bytes), 
            media_type=f"image/{db_image.format.lower()}"
        )
        
    except Exception as e:
        logger.error(f"Error rotating image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def _bytes_to_numpy(image_bytes: bytes) -> np.ndarray:
    try:
        image = Image.open(io.BytesIO(image_bytes))
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        return np.array(image)
        
    except Exception as e:
        logger.error(f"Error converting bytes to numpy: {e}")
        raise

def _numpy_to_bytes(image_array: np.ndarray, format: str = "JPEG") -> bytes:
    try:
        image = Image.fromarray(image_array.astype(np.uint8))
        
        output = io.BytesIO()
        image.save(output, format=format.upper())
        return output.getvalue()
        
    except Exception as e:
        logger.error(f"Error converting numpy to bytes: {e}")
        raise

@router.post("/process-upload")
async def process_uploaded_image(
    file: UploadFile = File(...),
    filter_type: str = "gaussian_blur",
    sigma: Optional[float] = 1.0,
    strength: Optional[float] = 1.0,
    brightness: Optional[float] = 0.0,
    contrast: Optional[float] = 1.0
) -> StreamingResponse:
    try:
        content = await file.read()
        
        image_array = _bytes_to_numpy(content)
        
        if filter_type == "gaussian_blur":
            result_array = core_service.apply_gaussian_blur(image_array, sigma or 1.0)
        elif filter_type == "sharpen":
            result_array = core_service.apply_sharpen_filter(image_array, strength or 1.0)
        elif filter_type == "brightness_contrast":
            result_array = core_service.adjust_brightness_contrast(
                image_array, brightness or 0.0, contrast or 1.0
            )
        else:
            raise HTTPException(status_code=400, detail="Unsupported filter type")
        
        result_bytes = _numpy_to_bytes(result_array, "JPEG")
        
        return StreamingResponse(
            io.BytesIO(result_bytes), 
            media_type="image/jpeg"
        )
        
    except Exception as e:
        logger.error(f"Error processing uploaded image: {e}")
        raise HTTPException(status_code=500, detail=str(e))
