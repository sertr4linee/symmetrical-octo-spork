from typing import List, Optional
from uuid import uuid4
from sqlalchemy.orm import Session
from fastapi import Depends
import base64
import hashlib
from PIL import Image as PILImage
import io

from src.models.database import get_db, ProjectDB, ImageDB
from src.models.project import Project, ProjectCreate, ProjectUpdate
from src.models.image import Image


class ProjectService:
    
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db
    
    async def get_projects(self, skip: int = 0, limit: int = 100) -> List[Project]:
        db_projects = self.db.query(ProjectDB).offset(skip).limit(limit).all()
        return [self._db_to_model(db_project) for db_project in db_projects]
    
    async def get_project(self, project_id: str) -> Optional[Project]:
        db_project = self.db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
        return self._db_to_model(db_project) if db_project else None
    
    async def create_project(self, project_data: ProjectCreate) -> Project:
        project_id = str(uuid4())
        
        db_project = ProjectDB(
            id=project_id,
            name=project_data.name,
            description=project_data.description,
            width=project_data.width,
            height=project_data.height,
            color_mode=project_data.color_mode,
            resolution=project_data.resolution
        )
        
        self.db.add(db_project)
        self.db.commit()
        self.db.refresh(db_project)
        
        return self._db_to_model(db_project)
    
    async def update_project(self, project_id: str, project_data: ProjectUpdate) -> Optional[Project]:
        db_project = self.db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
        
        if not db_project:
            return None
        
        update_data = project_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_project, field, value)
        
        self.db.commit()
        self.db.refresh(db_project)
        
        return self._db_to_model(db_project)
    
    async def delete_project(self, project_id: str) -> bool:
        db_project = self.db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
        
        if not db_project:
            return False
        
        self.db.delete(db_project)
        self.db.commit()
        
        return True
    
    async def get_project_images(self, project_id: str) -> List[dict]:
        """Obtenir les images d'un projet"""
        images = self.db.query(ImageDB).filter(ImageDB.project_id == project_id).all()
        return [self._image_db_to_dict(img) for img in images]

    async def add_image_to_project(self, project_id: str, image_data: dict) -> dict:
        """Ajouter une image à un projet"""
        try:
            # Décoder les données base64
            base64_data = image_data.get('data', '')
            if not base64_data:
                raise ValueError("No image data provided")
            
            # Décoder base64
            try:
                binary_data = base64.b64decode(base64_data)
            except Exception as e:
                raise ValueError(f"Invalid base64 data: {e}")
            
            # Calculer le checksum
            checksum = hashlib.md5(binary_data).hexdigest()
            
            # Vérifier si l'image existe déjà (même checksum)
            existing_image = self.db.query(ImageDB).filter(
                ImageDB.project_id == project_id,
                ImageDB.checksum == checksum
            ).first()
            
            if existing_image:
                return self._image_db_to_dict(existing_image)
            
            # Essayer d'extraire les dimensions avec PIL si disponible
            width, height, channels = None, None, None
            try:
                # Try to get image dimensions
                pil_image = PILImage.open(io.BytesIO(binary_data))
                width, height = pil_image.size
                channels = len(pil_image.getbands()) if hasattr(pil_image, 'getbands') else None
                pil_image.close()
            except:
                # PIL not available or image format not supported, continue without dimensions
                pass
            
            # Créer l'entrée en base
            image_id = str(uuid4())
            db_image = ImageDB(
                id=image_id,
                filename=image_data.get('name', 'uploaded_image.jpg'),
                content_type=image_data.get('type', 'image/jpeg'),
                project_id=project_id,
                width=width,
                height=height,
                channels=channels,
                color_mode='RGB',  # Default, could be detected from PIL
                file_size=len(binary_data),
                checksum=checksum,
                data=binary_data
            )
            
            self.db.add(db_image)
            self.db.commit()
            self.db.refresh(db_image)
            
            # Mettre à jour les statistiques du projet
            await self._update_project_stats(project_id)
            
            return self._image_db_to_dict(db_image)
            
        except Exception as e:
            self.db.rollback()
            raise ValueError(f"Failed to add image: {e}")

    async def _update_project_stats(self, project_id: str):
        """Mettre à jour les statistiques du projet (nombre d'images, taille totale)"""
        images = self.db.query(ImageDB).filter(ImageDB.project_id == project_id).all()
        
        image_count = len(images)
        total_size = sum(img.file_size for img in images)
        
        # Mettre à jour le projet
        db_project = self.db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
        if db_project:
            db_project.image_count = image_count
            db_project.file_size = total_size
            self.db.commit()

    def _image_db_to_dict(self, db_image: ImageDB) -> dict:
        """Convertir ImageDB en dictionnaire"""
        return {
            "id": db_image.id,
            "filename": db_image.filename,
            "content_type": db_image.content_type,
            "width": db_image.width,
            "height": db_image.height,
            "channels": db_image.channels,
            "color_mode": db_image.color_mode,
            "file_size": db_image.file_size,
            "checksum": db_image.checksum,
            "created_at": db_image.created_at.isoformat() if db_image.created_at else None,
            "updated_at": db_image.updated_at.isoformat() if db_image.updated_at else None,
            # Note: 'data' is excluded for performance reasons
        }


    
    def _db_to_model(self, db_project: ProjectDB) -> Project:
        return Project(
            id=db_project.id,
            name=db_project.name,
            description=db_project.description,
            width=db_project.width,
            height=db_project.height,
            color_mode=db_project.color_mode,
            resolution=db_project.resolution,

            created_at=db_project.created_at,
            updated_at=db_project.updated_at,
            image_count=db_project.image_count,
            file_size=db_project.file_size
        )
