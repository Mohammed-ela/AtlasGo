#!/bin/bash
echo "Démarrage du serveur AtlasGo API..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
