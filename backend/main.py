from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import httpx
import json
import os
import math
from cachetools import TTLCache
from pydantic import BaseModel
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AtlasGo API",
    description="API pour l'application AtlasGo - Points d'interet urbains",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

cache = TTLCache(maxsize=1000, ttl=300)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MOCK_DATA_FILE = os.path.join(BASE_DIR, "mock_data.json")

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

TYPE_TO_OVERPASS = {
    "toilet": 'node["amenity"="toilets"]',
    "parking": 'node["amenity"="parking"]',
    "wifi": 'node["internet_access"="wlan"]',
}


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


def load_mock_data():
    try:
        if os.path.exists(MOCK_DATA_FILE):
            with open(MOCK_DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        logger.error(f"Erreur chargement mock data: {e}")

    return {
        "places": [
            {
                "id": "1",
                "name": "Toilettes publiques - Chatelet",
                "type": "toilet",
                "location": {"latitude": 48.8566, "longitude": 2.3522},
                "address": "Place du Chatelet, 75001 Paris",
                "opening_hours": "24h/24",
                "description": "Toilettes publiques gratuites",
                "amenities": ["gratuit", "accessible"]
            },
            {
                "id": "2",
                "name": "Parking Chatelet",
                "type": "parking",
                "location": {"latitude": 48.8576, "longitude": 2.3532},
                "address": "Rue de Rivoli, 75001 Paris",
                "opening_hours": "24h/24",
                "description": "Parking souterrain",
                "amenities": ["payant", "surveille"]
            },
            {
                "id": "3",
                "name": "Wi-Fi gratuit - Hotel de Ville",
                "type": "wifi",
                "location": {"latitude": 48.8563, "longitude": 2.3522},
                "address": "Place de l'Hotel de Ville, 75004 Paris",
                "opening_hours": "24h/24",
                "description": "Reseau Wi-Fi public gratuit",
                "amenities": ["gratuit", "haut debit"]
            }
        ]
    }


mock_data = load_mock_data()


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371e3
    p1 = lat1 * math.pi / 180
    p2 = lat2 * math.pi / 180
    dp = (lat2 - lat1) * math.pi / 180
    dl = (lon2 - lon1) * math.pi / 180

    a = (math.sin(dp / 2) * math.sin(dp / 2) +
         math.cos(p1) * math.cos(p2) *
         math.sin(dl / 2) * math.sin(dl / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


def build_overpass_query(lat: float, lng: float, radius_m: int, types: List[str]) -> str:
    bbox_deg = radius_m / 111000
    south = lat - bbox_deg
    north = lat + bbox_deg
    west = lng - bbox_deg
    east = lng + bbox_deg

    filters = []
    for t in types:
        template = TYPE_TO_OVERPASS.get(t)
        if template:
            filters.append(f'{template}({south},{west},{north},{east});')

    if not filters:
        return ""

    joined = "\n          ".join(filters)
    return f"""
        [out:json][timeout:25];
        (
          {joined}
        );
        out body;
        """


async def query_overpass(lat: float, lng: float, radius_m: int, types: List[str]) -> dict:
    query = build_overpass_query(lat, lng, radius_m, types)
    if not query:
        return {}

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                OVERPASS_URL,
                data={"data": query}
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        logger.error(f"Erreur Overpass: {e}")
        return {}


def parse_overpass_type(tags: dict) -> Optional[str]:
    if tags.get("amenity") == "toilets":
        return "toilet"
    if tags.get("amenity") == "parking":
        return "parking"
    if tags.get("internet_access") in ("wlan", "wifi", "yes"):
        return "wifi"
    return None


def convert_overpass_to_pois(data: dict, center_lat: float, center_lng: float) -> List[POI]:
    pois = []
    for el in data.get("elements", []):
        if el.get("type") != "node":
            continue

        lat = el.get("lat", 0)
        lon = el.get("lon", 0)
        tags = el.get("tags", {})

        poi_type = parse_overpass_type(tags)
        if not poi_type:
            continue

        distance = calculate_distance(center_lat, center_lng, lat, lon)

        name = tags.get("name")
        if not name:
            type_labels = {"toilet": "Toilettes", "parking": "Parking", "wifi": "Wi-Fi"}
            street = tags.get("addr:street", "")
            name = f"{type_labels.get(poi_type, poi_type)} - {street}" if street else f"{type_labels.get(poi_type, poi_type)}"

        addr_parts = [tags.get("addr:housenumber", ""), tags.get("addr:street", ""),
                      tags.get("addr:postcode", ""), tags.get("addr:city", "")]
        address = " ".join(p for p in addr_parts if p).strip() or tags.get("addr:full")

        amenities = []
        if tags.get("fee") == "no":
            amenities.append("gratuit")
        elif tags.get("fee") == "yes":
            amenities.append("payant")
        if tags.get("wheelchair") == "yes":
            amenities.append("accessible")

        pois.append(POI(
            id=f"osm_{el.get('id', '')}",
            name=name,
            type=poi_type,
            location=Location(latitude=lat, longitude=lon),
            distance=distance,
            address=address,
            opening_hours=tags.get("opening_hours"),
            description=tags.get("description"),
            amenities=amenities
        ))

    return pois


def get_mock_pois(lat: float, lng: float, radius_m: int, types: List[str]) -> List[POI]:
    pois = []
    for p in mock_data.get("places", []):
        if p["type"] not in types:
            continue
        dist = calculate_distance(lat, lng, p["location"]["latitude"], p["location"]["longitude"])
        if dist <= radius_m:
            pois.append(POI(
                id=p["id"],
                name=p["name"],
                type=p["type"],
                location=Location(**p["location"]),
                distance=dist,
                address=p.get("address"),
                opening_hours=p.get("opening_hours"),
                description=p.get("description"),
                amenities=p.get("amenities", [])
            ))
    return pois


@app.get("/")
async def root():
    return {"message": "AtlasGo API", "version": "1.0.0"}


@app.get("/places", response_model=APIResponse)
async def get_places(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius_m: int = Query(1000, description="Rayon en metres"),
    types: str = Query("toilet,parking,wifi", description="Types separes par des virgules")
):
    try:
        cache_key = f"{lat:.4f}_{lng:.4f}_{radius_m}_{types}"
        if cache_key in cache:
            cached = cache[cache_key]
            return APIResponse(places=cached["places"], total=cached["total"], cached=True)

        requested_types = [t.strip() for t in types.split(",")]

        overpass_data = await query_overpass(lat, lng, radius_m, requested_types)

        if overpass_data and overpass_data.get("elements"):
            pois = convert_overpass_to_pois(overpass_data, lat, lng)
            logger.info(f"{len(pois)} POI depuis Overpass")
        else:
            pois = get_mock_pois(lat, lng, radius_m, requested_types)
            logger.info(f"Fallback mock: {len(pois)} POI")

        pois.sort(key=lambda x: x.distance or 0)

        cache[cache_key] = {"places": pois, "total": len(pois)}

        return APIResponse(places=pois, total=len(pois), cached=False)

    except Exception as e:
        logger.error(f"Erreur /places: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")


@app.get("/search", response_model=List[POI])
async def search_places(
    q: str = Query(..., description="Terme de recherche"),
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude")
):
    try:
        query_lower = q.lower()
        results = []

        for cached_data in cache.values():
            for poi in cached_data.get("places", []):
                if isinstance(poi, POI):
                    if query_lower in poi.name.lower() or (poi.address and query_lower in poi.address.lower()):
                        poi.distance = calculate_distance(lat, lng, poi.location.latitude, poi.location.longitude)
                        results.append(poi)

        seen_ids = {r.id for r in results}

        for p in mock_data.get("places", []):
            if p["id"] in seen_ids:
                continue
            if query_lower in p["name"].lower() or (p.get("address") and query_lower in p["address"].lower()):
                dist = calculate_distance(lat, lng, p["location"]["latitude"], p["location"]["longitude"])
                results.append(POI(
                    id=p["id"],
                    name=p["name"],
                    type=p["type"],
                    location=Location(**p["location"]),
                    distance=dist,
                    address=p.get("address"),
                    opening_hours=p.get("opening_hours"),
                    description=p.get("description"),
                    amenities=p.get("amenities", [])
                ))

        results.sort(key=lambda x: x.distance or 0)
        return results

    except Exception as e:
        logger.error(f"Erreur /search: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
