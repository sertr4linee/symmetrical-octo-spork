#!/usr/bin/env python3

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import sys
from pathlib import Path

# Add src to path for relative imports
sys.path.insert(0, str(Path(__file__).parent / "src"))

# Import components
from api.router import api_router
from models.database import engine, Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestionnaire de cycle de vie de l'application"""
    # Phase de démarrage
    print("🚀 Démarrage du serveur...")
    
    # Initialisation de la base de données
    try:
        # Utiliser l'approche synchrone pour SQLAlchemy
        Base.metadata.create_all(bind=engine)
        print("✅ Base de données initialisée")
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation de la DB: {e}")
        raise
    
    print("✅ Serveur prêt!")
    
    # Yield control - this separates startup from shutdown
    yield
    
    # Phase d'arrêt
    print("🛑 Arrêt du serveur...")
    print("✅ Nettoyage terminé")


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
        allow_origins=["http://localhost:3000", "http://localhost:8080"],
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
