from typing import Optional, List
from uuid import uuid4
import hashlib
import json
from PIL import Image as PILImage
import io
from sqlalchemy.orm import Session
from fastapi import Depends

from src.models.database import get_db, ImageDB, ImageHistoryDB
from src.models.image import Image, ImageCreate, ImageProcess, ImageHistory


class ImageService:
    
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db
    
    async def create_image(self, image_data: ImageCreate) -> Image:
        image_id = str(uuid4())
        
        checksum = hashlib.md5(image_data.data).hexdigest()
        
        width, height, channels = None, None, None
        try:
            pil_image = PILImage.open(io.BytesIO(image_data.data))
            width, height = pil_image.size
            channels = len(pil_image.getbands()) if pil_image.mode else None
        except Exception as e:
            print(f"Warning: Could not extract image metadata: {e}")
        
        db_image = ImageDB(
            id=image_id,
            filename=image_data.filename,
            content_type=image_data.content_type,
            project_id=image_data.project_id,
            width=width,
            height=height,
            channels=channels,
            file_size=len(image_data.data),
            checksum=checksum,
            data=image_data.data
        )
        
        self.db.add(db_image)
        self.db.commit()
        self.db.refresh(db_image)
        
        return self._db_to_model(db_image)
    
    async def get_image(self, image_id: str) -> Optional[Image]:
        db_image = self.db.query(ImageDB).filter(ImageDB.id == image_id).first()
        return self._db_to_model(db_image) if db_image else None
    
    async def get_image_data(self, image_id: str) -> Optional[ImageDB]:
        return self.db.query(ImageDB).filter(ImageDB.id == image_id).first()
    
    async def process_image(self, image_id: str, process_data: ImageProcess) -> Optional[Image]:
        db_image = self.db.query(ImageDB).filter(ImageDB.id == image_id).first()
        
        if not db_image:
            return None
        
        # TODO: Intégration avec le core C++ ici
        # Pour l'instant, on simule le traitement
        processed_data = await self._simulate_processing(db_image.data, process_data)
        
        new_filename = f"{process_data.operation}_{db_image.filename}"
        new_image_data = ImageCreate(
            filename=new_filename,
            content_type=db_image.content_type,
            project_id=db_image.project_id,
            data=processed_data
        )
        
        result_image = await self.create_image(new_image_data)
        
        await self._add_to_history(image_id, process_data, result_image.id)
        
        return result_image
    
    async def delete_image(self, image_id: str) -> bool:
        db_image = self.db.query(ImageDB).filter(ImageDB.id == image_id).first()
        
        if not db_image:
            return False
        
        self.db.delete(db_image)
        self.db.commit()
        
        return True
    
    async def get_image_history(self, image_id: str) -> List[ImageHistory]:
        db_history = self.db.query(ImageHistoryDB).filter(
            ImageHistoryDB.image_id == image_id
        ).order_by(ImageHistoryDB.timestamp.desc()).all()
        
        return [self._history_db_to_model(hist) for hist in db_history]
    
    async def _simulate_processing(self, image_data: bytes, process_data: ImageProcess) -> bytes:
        try:
            pil_image = PILImage.open(io.BytesIO(image_data))
            
            if process_data.operation == "brightness":
                pass
            elif process_data.operation == "resize":
                width = process_data.parameters.get("width", pil_image.width)
                height = process_data.parameters.get("height", pil_image.height)
                pil_image = pil_image.resize((width, height), PILImage.Resampling.LANCZOS)
            
            output = io.BytesIO()
            pil_image.save(output, format='JPEG')
            return output.getvalue()
            
        except Exception as e:
            print(f"Error processing image: {e}")
            return image_data
    
    async def _add_to_history(self, image_id: str, process_data: ImageProcess, result_id: str):
        history_id = str(uuid4())
        
        db_history = ImageHistoryDB(
            id=history_id,
            image_id=image_id,
            operation=process_data.operation,
            parameters=json.dumps(process_data.parameters)
        )
        
        self.db.add(db_history)
        self.db.commit()
    
    def _db_to_model(self, db_image: ImageDB) -> Image:
        return Image(
            id=db_image.id,
            filename=db_image.filename,
            content_type=db_image.content_type,
            project_id=db_image.project_id,
            width=db_image.width,
            height=db_image.height,
            channels=db_image.channels,
            color_mode=db_image.color_mode,
            file_size=db_image.file_size,
            checksum=db_image.checksum,
            created_at=db_image.created_at,
            updated_at=db_image.updated_at
        )
    
    def _history_db_to_model(self, db_history: ImageHistoryDB) -> ImageHistory:
        parameters = json.loads(db_history.parameters) if db_history.parameters else {}
        
        return ImageHistory(
            id=db_history.id,
            image_id=db_history.image_id,
            operation=db_history.operation,
            parameters=parameters,
            timestamp=db_history.timestamp,
            user_id=db_history.user_id
        )
