from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import httpx
import json
import os
from datetime import datetime, timedelta
from cachetools import TTLCache
from pydantic import BaseModel
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AtlasGo API",
    description="API pour l'application AtlasGo - Points d'intérêt",
    version="1.0.0"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifier les domaines autorisés
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache en mémoire avec TTL de 5 minutes
cache = TTLCache(maxsize=1000, ttl=300)

# Modèles Pydantic
class Location(BaseModel):
    latitude: float
    longitude: float

class POI(BaseModel):
    id: str
    name: str
    type: str
    location: Location
    distance: Optional[float] = None
    address: Optional[str] = None
    opening_hours: Optional[str] = None
    description: Optional[str] = None
    amenities: Optional[List[str]] = None

class APIResponse(BaseModel):
    places: List[POI]
    total: int
    cached: bool

# Données mock de secours
MOCK_DATA_FILE = "mock_data.json"

def load_mock_data():
    """Charge les données mock depuis le fichier JSON"""
    try:
        if os.path.exists(MOCK_DATA_FILE):
            with open(MOCK_DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        logger.error(f"Erreur chargement données mock: {e}")
    
    # Données mock par défaut
    return {
        "places": [
            {
                "id": "1",
                "name": "Toilettes publiques - Châtelet",
                "type": "toilet",
                "location": {"latitude": 48.8566, "longitude": 2.3522},
                "address": "Place du Châtelet, 75001 Paris",
                "opening_hours": "24h/24",
                "description": "Toilettes publiques gratuites",
                "amenities": ["gratuit", "accessible"]
            },
            {
                "id": "2",
                "name": "Parking Châtelet",
                "type": "parking",
                "location": {"latitude": 48.8576, "longitude": 2.3532},
                "address": "Rue de Rivoli, 75001 Paris",
                "opening_hours": "24h/24",
                "description": "Parking souterrain",
                "amenities": ["payant", "surveillé"]
            },
            {
                "id": "3",
                "name": "Wi-Fi gratuit - Hôtel de Ville",
                "type": "wifi",
                "location": {"latitude": 48.8563, "longitude": 2.3522},
                "address": "Place de l'Hôtel de Ville, 75004 Paris",
                "opening_hours": "24h/24",
                "description": "Réseau Wi-Fi public gratuit",
                "amenities": ["gratuit", "haut débit"]
            }
        ]
    }

# Charger les données mock au démarrage
mock_data = load_mock_data()

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calcule la distance entre deux points en mètres"""
    import math
    
    R = 6371e3  # Rayon de la Terre en mètres
    φ1 = lat1 * math.pi / 180
    φ2 = lat2 * math.pi / 180
    Δφ = (lat2 - lat1) * math.pi / 180
    Δλ = (lon2 - lon1) * math.pi / 180

    a = (math.sin(Δφ / 2) * math.sin(Δφ / 2) +
         math.cos(φ1) * math.cos(φ2) *
         math.sin(Δλ / 2) * math.sin(Δλ / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c

def query_overpass_api(lat: float, lng: float, radius_m: int, types: List[str]) -> List[dict]:
    """Interroge l'API Overpass pour récupérer les POI"""
    try:
        # Conversion du rayon en degrés (approximation)
        radius_deg = radius_m / 111000  # 1 degré ≈ 111km
        
        # Construction de la requête Overpass
        overpass_query = f"""
        [out:json][timeout:25];
        (
          node["amenity"="toilets"]({lat-radius_deg},{lng-radius_deg},{lat+radius_deg},{lng+radius_deg});
          node["amenity"="parking"]({lat-radius_deg},{lng-radius_deg},{lat+radius_deg},{lng+radius_deg});
          node["internet_access"="wifi"]({lat-radius_deg},{lng-radius_deg},{lat+radius_deg},{lng+radius_deg});
        );
        out geom;
        """
        
        async def fetch_overpass():
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://overpass-api.de/api/interpreter",
                    data={"data": overpass_query}
                )
                return response.json()
        
        # Exécution synchrone pour simplifier
        import asyncio
        return asyncio.run(fetch_overpass())
        
    except Exception as e:
        logger.error(f"Erreur API Overpass: {e}")
        return []

def convert_overpass_to_poi(overpass_data: List[dict], center_lat: float, center_lng: float) -> List[POI]:
    """Convertit les données Overpass en format POI"""
    pois = []
    
    for element in overpass_data.get("elements", []):
        if element.get("type") != "node":
            continue
            
        lat = element.get("lat", 0)
        lon = element.get("lon", 0)
        tags = element.get("tags", {})
        
        # Déterminer le type
        poi_type = None
        if tags.get("amenity") == "toilets":
            poi_type = "toilet"
        elif tags.get("amenity") == "parking":
            poi_type = "parking"
        elif tags.get("internet_access") == "wifi":
            poi_type = "wifi"
        
        if not poi_type:
            continue
            
        # Calculer la distance
        distance = calculate_distance(center_lat, center_lng, lat, lon)
        
        # Créer le POI
        poi = POI(
            id=f"overpass_{element.get('id', '')}",
            name=tags.get("name", f"{poi_type.title()} - {lat:.4f}, {lon:.4f}"),
            type=poi_type,
            location=Location(latitude=lat, longitude=lon),
            distance=distance,
            address=tags.get("addr:full") or tags.get("addr:street"),
            opening_hours=tags.get("opening_hours"),
            description=tags.get("description"),
            amenities=[]
        )
        
        pois.append(poi)
    
    return pois

@app.get("/")
async def root():
    return {"message": "AtlasGo API", "version": "1.0.0"}

@app.get("/places", response_model=APIResponse)
async def get_places(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius_m: int = Query(1000, description="Rayon de recherche en mètres"),
    types: str = Query("toilet,parking,wifi", description="Types de POI séparés par des virgules")
):
    """
    Récupère les points d'intérêt autour d'une position donnée
    """
    try:
        # Vérifier le cache
        cache_key = f"{lat}_{lng}_{radius_m}_{types}"
        if cache_key in cache:
            logger.info("Données récupérées du cache")
            return APIResponse(places=cache[cache_key]["places"], total=cache[cache_key]["total"], cached=True)
        
        # Parser les types
        requested_types = [t.strip() for t in types.split(",")]
        
        # Essayer l'API Overpass
        overpass_data = query_overpass_api(lat, lng, radius_m, requested_types)
        
        if overpass_data:
            pois = convert_overpass_to_poi(overpass_data, lat, lng)
            logger.info(f"Récupéré {len(pois)} POI depuis Overpass")
        else:
            # Fallback sur les données mock
            logger.info("Utilisation des données mock")
            pois = []
            for place_data in mock_data["places"]:
                if place_data["type"] in requested_types:
                    # Calculer la distance
                    distance = calculate_distance(
                        lat, lng,
                        place_data["location"]["latitude"],
                        place_data["location"]["longitude"]
                    )
                    
                    if distance <= radius_m:
                        poi = POI(
                            id=place_data["id"],
                            name=place_data["name"],
                            type=place_data["type"],
                            location=Location(**place_data["location"]),
                            distance=distance,
                            address=place_data.get("address"),
                            opening_hours=place_data.get("opening_hours"),
                            description=place_data.get("description"),
                            amenities=place_data.get("amenities", [])
                        )
                        pois.append(poi)
        
        # Trier par distance
        pois.sort(key=lambda x: x.distance or 0)
        
        # Mettre en cache
        cache[cache_key] = {
            "places": pois,
            "total": len(pois)
        }
        
        return APIResponse(places=pois, total=len(pois), cached=False)
        
    except Exception as e:
        logger.error(f"Erreur récupération POI: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

@app.get("/search")
async def search_places(
    q: str = Query(..., description="Terme de recherche"),
    lat: float = Query(..., description="Latitude de référence"),
    lng: float = Query(..., description="Longitude de référence")
):
    """
    Recherche des POI par nom (implémentation basique)
    """
    try:
        # Recherche simple dans les données mock
        results = []
        for place_data in mock_data["places"]:
            if q.lower() in place_data["name"].lower():
                distance = calculate_distance(
                    lat, lng,
                    place_data["location"]["latitude"],
                    place_data["location"]["longitude"]
                )
                
                poi = POI(
                    id=place_data["id"],
                    name=place_data["name"],
                    type=place_data["type"],
                    location=Location(**place_data["location"]),
                    distance=distance,
                    address=place_data.get("address"),
                    opening_hours=place_data.get("opening_hours"),
                    description=place_data.get("description"),
                    amenities=place_data.get("amenities", [])
                )
                results.append(poi)
        
        return results
        
    except Exception as e:
        logger.error(f"Erreur recherche: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
