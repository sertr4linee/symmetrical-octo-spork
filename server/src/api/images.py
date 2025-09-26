from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import StreamingResponse, Response
from typing import List, Optional
import uuid
import io
import base64
from PIL import Image as PILImage

from src.models.image import Image, ImageCreate, ImageProcess, ImageImport
from src.services.image_service import ImageService

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


@router.post("/import/{project_id}")
async def import_image(
    project_id: str,
    import_data: dict,
    image_service: ImageService = Depends()
):
    try:
        name = import_data.get('name', 'imported_image.png')
        data = import_data.get('data', '')
        format = import_data.get('format', 'png')
        
        if data.startswith('data:'):
            data = data.split(',')[1]
        
            image_data = base64.b64decode(data)
        
        pil_image = PILImage.open(io.BytesIO(image_data))
        width, height = pil_image.size
        
        image_import = ImageImport(
            name=name,
            project_id=project_id,
            width=width,
            height=height,
            format=format,
            size=len(image_data)
        )
        
        result = await image_service.create_image_with_data(image_import, image_data)
        return {
            "success": True,
            "data": {
                "id": result.id,
                "filename": result.filename,
                "width": result.width,
                "height": result.height,
                "content_type": result.content_type,
                "file_size": result.file_size
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error importing image: {str(e)}")


@router.get("/{image_id}/export")
async def export_image(
    image_id: str,
    format: Optional[str] = "png",
    image_service: ImageService = Depends()
):
    try:
        image_data = await image_service.get_image_data(image_id)
        if not image_data:
            raise HTTPException(status_code=404, detail="Image not found")
        
        pil_image = PILImage.open(io.BytesIO(image_data.data))
        
        output_buffer = io.BytesIO()
        if format.lower() == 'jpg' or format.lower() == 'jpeg':
            if pil_image.mode in ('RGBA', 'P'):
                pil_image = pil_image.convert('RGB')
            pil_image.save(output_buffer, format='JPEG', quality=95)
            media_type = "image/jpeg"
        else:
            pil_image.save(output_buffer, format='PNG')
            media_type = "image/png"
        
        output_buffer.seek(0)
        
        return Response(
            content=output_buffer.getvalue(),
            media_type=media_type,
            headers={
                "Content-Disposition": f"attachment; filename=exported_image.{format}"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting image: {str(e)}")
