#!/bin/bash
# Script de lancement du serveur Better GIMP

cd "$(dirname "$0")"
export PYTHONPATH="$PWD/src:$PYTHONPATH"

echo "starting better gimp APapiI..."
echo "working dir: $PWD"

./venv/bin/python -c "
import sys
sys.path.insert(0, 'src')
from main import create_app
import uvicorn

app = create_app()
uvicorn.run(app, host='127.0.0.1', port=8000, log_level='info')
"
