from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import StreamingResponse
from typing import List, Optional
import uuid
import io
from PIL import Image as PILImage

from models.image import Image, ImageCreate, ImageProcess
from services.image_service import ImageService

router = APIRouter()


@router.post("/upload")
async def upload_image(
    image_service: ImageService = Depends()
):
    return {"message": "Upload endpoint - à implémenter avec file upload"}


@router.get("/{image_id}")
async def get_image_info(
    image_id: str,
    image_service: ImageService = Depends()
):
    image = await image_service.get_image(image_id)
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    return image


@router.get("/{image_id}/preview")
async def get_image_preview(
    image_id: str,
    width: Optional[int] = 300,
    height: Optional[int] = 300,
    image_service: ImageService = Depends()
):
    image_data = await image_service.get_image_data(image_id)
    if not image_data:
        raise HTTPException(status_code=404, detail="Image not found")
    
    try:
        pil_image = PILImage.open(io.BytesIO(image_data.data))
        pil_image.thumbnail((width, height), PILImage.Resampling.LANCZOS)
        
        img_byte_arr = io.BytesIO()
        pil_image.save(img_byte_arr, format='JPEG')
        img_byte_arr.seek(0)
        
        return StreamingResponse(
            io.BytesIO(img_byte_arr.getvalue()), 
            media_type="image/jpeg"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating preview: {str(e)}")


@router.post("/{image_id}/process")
async def process_image(
    image_id: str,
    process_data: ImageProcess,
    image_service: ImageService = Depends()
):
    """Appliquer un traitement à une image"""
    # TODO: Intégration avec le core C++ ici
    result = await image_service.process_image(image_id, process_data)
    if not result:
        raise HTTPException(status_code=404, detail="Image not found")
    
    return {
        "image_id": image_id,
        "operation": process_data.operation,
        "parameters": process_data.parameters,
        "result_id": result.id,
        "message": "Image processed successfully"
    }


@router.delete("/{image_id}")
async def delete_image(
    image_id: str,
    image_service: ImageService = Depends()
):
    success = await image_service.delete_image(image_id)
    if not success:
        raise HTTPException(status_code=404, detail="Image not found")
    return {"message": "Image deleted successfully"}


@router.get("/{image_id}/history")
async def get_image_history(
    image_id: str,
    image_service: ImageService = Depends()
):
    history = await image_service.get_image_history(image_id)
    return {"image_id": image_id, "history": history}
