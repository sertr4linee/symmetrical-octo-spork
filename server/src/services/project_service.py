"""
Service métier pour la gestion des projets
"""

from typing import List, Optional
from uuid import uuid4
from sqlalchemy.orm import Session
from fastapi import Depends

from models.database import get_db, ProjectDB
from models.project import Project, ProjectCreate, ProjectUpdate


class ProjectService:
    """Service pour gérer les projets"""
    
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db
    
    async def get_projects(self, skip: int = 0, limit: int = 100) -> List[Project]:
        """Obtenir la liste des projets"""
        db_projects = self.db.query(ProjectDB).offset(skip).limit(limit).all()
        return [self._db_to_model(db_project) for db_project in db_projects]
    
    async def get_project(self, project_id: str) -> Optional[Project]:
        """Obtenir un projet par son ID"""
        db_project = self.db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
        return self._db_to_model(db_project) if db_project else None
    
    async def create_project(self, project_data: ProjectCreate) -> Project:
        """Créer un nouveau projet"""
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
        """Mettre à jour un projet"""
        db_project = self.db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
        
        if not db_project:
            return None
        
        # Mettre à jour uniquement les champs fournis
        update_data = project_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_project, field, value)
        
        self.db.commit()
        self.db.refresh(db_project)
        
        return self._db_to_model(db_project)
    
    async def delete_project(self, project_id: str) -> bool:
        """Supprimer un projet"""
        db_project = self.db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
        
        if not db_project:
            return False
        
        self.db.delete(db_project)
        self.db.commit()
        
        return True
    
    async def get_project_images(self, project_id: str) -> List[dict]:
        """Obtenir les images d'un projet"""
        # TODO: Implémenter avec le service d'images
        return []
    
    def _db_to_model(self, db_project: ProjectDB) -> Project:
        """Convertir un modèle DB en modèle Pydantic"""
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
