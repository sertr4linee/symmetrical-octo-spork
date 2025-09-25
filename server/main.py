#!/usr/bin/env python3
"""
Better GIMP - Backend API Server
Point d'entrée principal de l'API FastAPI
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import sys
from pathlib import Path

# Ajouter le répertoire src au path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from api.router import api_router
from models.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("starting api..")
    
    await init_db()
    print("db init")
    
    print("shutting down api...")


def create_app() -> FastAPI:
    app = FastAPI(
        title="bettergimp",
        description="api pour el famoso simulated",
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json"
    )
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://localhost:8080"],  # Electron/React dev
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.include_router(api_router, prefix="/api")
    
    @app.get("/")
    async def root():
        return {
            "message": "bettergimp",
            "version": "0.1.0",
            "docs": "/docs"
        }
    
    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "message": "API is running"}
    
    return app


def main():
    """Point d'entrée principal"""
    app = create_app()
    
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("RELOAD", "true").lower() == "true"
    
    print(f"server will start on http://{host}:{port}")
    print(f" api doc: http://{host}:{port}/docs")
    
    uvicorn.run(
        "main:create_app",
        factory=True,
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )


if __name__ == "__main__":
    main()
