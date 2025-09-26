from sqlalchemy import create_engine, Column, String, Integer, DateTime, Text, LargeBinary, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.sqlite import BLOB
from datetime import datetime
import os
from pathlib import Path

DATABASE_DIR = Path(__file__).parent.parent.parent / "data"
DATABASE_DIR.mkdir(exist_ok=True)
DATABASE_URL = f"sqlite:///{DATABASE_DIR}/bettergimp.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class ProjectDB(Base):
    __tablename__ = "projects"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    width = Column(Integer, nullable=False)
    height = Column(Integer, nullable=False)
    color_mode = Column(String(50), default="RGB")
    resolution = Column(Integer, default=300)
    canvas_data = Column(Text, nullable=True)  # JSON du canvas Fabric.js
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    image_count = Column(Integer, default=0)
    file_size = Column(Integer, default=0)


class ImageDB(Base):
    __tablename__ = "images"
    
    id = Column(String, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    content_type = Column(String(100), nullable=False)
    project_id = Column(String, nullable=True, index=True)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    channels = Column(Integer, nullable=True)
    color_mode = Column(String(50), nullable=True)
    file_size = Column(Integer, default=0)
    checksum = Column(String(32), nullable=True)
    data = Column(LargeBinary, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ImageHistoryDB(Base):
    __tablename__ = "image_history"
    
    id = Column(String, primary_key=True, index=True)
    image_id = Column(String, nullable=False, index=True)
    operation = Column(String(100), nullable=False)
    parameters = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String, nullable=True)


async def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully")
    except Exception as e:
        print(f"Error creating database tables: {e}")
        raise


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
