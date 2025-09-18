#!/bin/bash
# Script de lancement du serveur Better GIMP

cd "$(dirname "$0")"
export PYTHONPATH="$PWD/src:$PYTHONPATH"

echo "🚀 Starting Better GIMP Backend API..."
echo "📁 Working directory: $PWD"
echo "🐍 Python path: $PYTHONPATH"

./venv/bin/python -c "
import sys
sys.path.insert(0, 'src')
from main import create_app
import uvicorn

app = create_app()
uvicorn.run(app, host='127.0.0.1', port=8000, log_level='info')
"
