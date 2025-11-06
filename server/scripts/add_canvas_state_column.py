#!/usr/bin/env python3
"""
Script de migration léger : ajoute la colonne `canvas_state` à la table `projects`
si elle est absente (SQLite).
Usage: python server/scripts/add_canvas_state_column.py
"""
import sqlite3
from pathlib import Path
import sys

# Chemin par défaut (doit correspondre à DATABASE_URL dans src/models/database.py)
DB_PATH = Path(__file__).parent.parent / "data" / "bettergimp.db"

if not DB_PATH.exists():
    print(f"Base de données introuvable : {DB_PATH}")
    sys.exit(1)

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

try:
    cur.execute("PRAGMA table_info('projects')")
    cols = [row[1] for row in cur.fetchall()]
    if 'canvas_state' in cols:
        print("La colonne 'canvas_state' existe déjà — aucune action nécessaire.")
    else:
        print("Colonne 'canvas_state' absente — ajout en cours...")
        cur.execute("ALTER TABLE projects ADD COLUMN canvas_state TEXT")
        conn.commit()
        print("Colonne 'canvas_state' ajoutée avec succès.")

    # affichage final des colonnes
    cur.execute("PRAGMA table_info('projects')")
    for row in cur.fetchall():
        print(row)

except sqlite3.DatabaseError as e:
    print(f"Erreur SQLite : {e}")
    sys.exit(2)
finally:
    conn.close()
