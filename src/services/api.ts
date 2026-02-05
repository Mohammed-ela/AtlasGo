import axios from 'axios';
import { POI, APIResponse, Location } from '@/types';

const API_BASE_URL = 'http://192.168.1.129:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface PlacesParams {
  lat: number;
  lng: number;
  radius_m: number;
  types: string[];
}

function mapPOI(raw: any): POI {
  return {
    id: raw.id,
    name: raw.name,
    type: raw.type,
    location: raw.location,
    distance: raw.distance,
    address: raw.address,
    openingHours: raw.opening_hours || raw.openingHours,
    description: raw.description,
    amenities: raw.amenities,
  };
}

export const placesApi = {
  getPlaces: async (params: PlacesParams): Promise<APIResponse> => {
    const { lat, lng, radius_m, types } = params;
    const typesParam = types.join(',');

    const response = await api.get(
      `/places?lat=${lat}&lng=${lng}&radius_m=${radius_m}&types=${typesParam}`
    );

    return {
      places: (response.data.places || []).map(mapPOI),
      total: response.data.total,
      cached: response.data.cached,
    };
  },

  searchPlaces: async (query: string, location: Location): Promise<POI[]> => {
    try {
      const response = await api.get(
        `/search?q=${encodeURIComponent(query)}&lat=${location.latitude}&lng=${location.longitude}`
      );
      return (response.data || []).map(mapPOI);
    } catch {
      return [];
    }
  },
};

export const mockPlaces: POI[] = [
  {
    id: '1',
    name: 'Toilettes publiques - Chatelet',
    type: 'toilet',
    location: { latitude: 48.8566, longitude: 2.3522 },
    distance: 150,
    address: 'Place du Chatelet, 75001 Paris',
    openingHours: '24h/24',
    description: 'Toilettes publiques gratuites',
    amenities: ['gratuit', 'accessible'],
  },
  {
    id: '2',
    name: 'Parking Chatelet',
    type: 'parking',
    location: { latitude: 48.8576, longitude: 2.3532 },
    distance: 200,
    address: 'Rue de Rivoli, 75001 Paris',
    openingHours: '24h/24',
    description: 'Parking souterrain',
    amenities: ['payant', 'surveille'],
  },
  {
    id: '3',
    name: 'Wi-Fi gratuit - Hotel de Ville',
    type: 'wifi',
    location: { latitude: 48.8563, longitude: 2.3522 },
    distance: 300,
    address: "Place de l'Hotel de Ville, 75004 Paris",
    openingHours: '24h/24',
    description: 'Reseau Wi-Fi public gratuit',
    amenities: ['gratuit', 'haut debit'],
  },
  {
    id: '4',
    name: 'Toilettes - Gare du Nord',
    type: 'toilet',
    location: { latitude: 48.8808, longitude: 2.3553 },
    distance: 2800,
    address: '18 Rue de Dunkerque, 75010 Paris',
    openingHours: '5h-23h',
    description: 'Toilettes en gare',
    amenities: ['payant', 'accessible'],
  },
  {
    id: '5',
    name: 'Parking Gare du Nord',
    type: 'parking',
    location: { latitude: 48.8818, longitude: 2.3563 },
    distance: 2900,
    address: 'Rue de Dunkerque, 75010 Paris',
    openingHours: '24h/24',
    description: 'Parking de la gare',
    amenities: ['payant', 'surveille', 'ascenseur'],
  },
  {
    id: '6',
    name: 'Wi-Fi - Cafe de Flore',
    type: 'wifi',
    location: { latitude: 48.8542, longitude: 2.3319 },
    distance: 1700,
    address: '172 Boulevard Saint-Germain, 75006 Paris',
    openingHours: '7h-2h',
    description: 'Wi-Fi gratuit pour les clients',
    amenities: ['gratuit', 'haut debit'],
  },
  {
    id: '7',
    name: 'Toilettes - Jardin du Luxembourg',
    type: 'toilet',
    location: { latitude: 48.8462, longitude: 2.3372 },
    distance: 1600,
    address: 'Jardin du Luxembourg, 75006 Paris',
    openingHours: '7h30-21h30',
    description: 'Toilettes publiques du jardin',
    amenities: ['gratuit', 'accessible'],
  },
  {
    id: '8',
    name: 'Parking Montparnasse',
    type: 'parking',
    location: { latitude: 48.8422, longitude: 2.3219 },
    distance: 2700,
    address: "Rue de l'Arrivee, 75015 Paris",
    openingHours: '24h/24',
    description: 'Parking souterrain',
    amenities: ['payant', 'surveille', 'ascenseur'],
  },
];

export default api;
