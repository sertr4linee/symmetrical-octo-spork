# Server - Python Backend API

Ce dossier contient l'API backend de Better GIMP, développée avec FastAPI.

source venv/bin/activate

## Structure

```
server/
├── src/
│   ├── api/           # Endpoints API REST
│   ├── models/        # Modèles de données (Pydantic)
│   └── services/      # Logique métier
├── tests/             # Tests unitaires Python
├── requirements.txt   # Dépendances Python
└── main.py           # Point d'entrée de l'application
```

## Technologies

- **FastAPI 0.104+**: Framework web moderne
- **Pydantic**: Validation des données
- **SQLite/PostgreSQL**: Base de données
- **Uvicorn**: Serveur ASGI

## Développement

```bash
cd server
pip install -r requirements.txt
python main.py
```

L'API sera disponible sur http://localhost:8000
Documentation interactive : http://localhost:8000/docs
