import axios from 'axios';
import { POI, APIResponse, Location } from '@/types';

const API_BASE_URL = 'http://localhost:8000'; // À changer pour la production

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

export const placesApi = {
  /**
   * Récupère les POI autour d'une position
   */
  getPlaces: async (params: PlacesParams): Promise<APIResponse> => {
    try {
      const { lat, lng, radius_m, types } = params;
      const typesParam = types.join(',');
      
      const response = await api.get<APIResponse>(
        `/places?lat=${lat}&lng=${lng}&radius_m=${radius_m}&types=${typesParam}`
      );
      
      return response.data;
    } catch (error) {
      console.error('Erreur API places:', error);
      throw new Error('Impossible de récupérer les lieux');
    }
  },

  /**
   * Recherche de POI par nom (optionnel)
   */
  searchPlaces: async (query: string, location: Location): Promise<POI[]> => {
    try {
      const response = await api.get<POI[]>(
        `/search?q=${encodeURIComponent(query)}&lat=${location.latitude}&lng=${location.longitude}`
      );
      
      return response.data;
    } catch (error) {
      console.error('Erreur recherche:', error);
      return [];
    }
  },
};

// Mock data pour le fallback
export const mockPlaces: POI[] = [
  {
    id: '1',
    name: 'Toilettes publiques - Châtelet',
    type: 'toilet',
    location: { latitude: 48.8566, longitude: 2.3522 },
    distance: 150,
    address: 'Place du Châtelet, 75001 Paris',
    openingHours: '24h/24',
    description: 'Toilettes publiques gratuites',
    amenities: ['gratuit', 'accessible'],
  },
  {
    id: '2',
    name: 'Parking Châtelet',
    type: 'parking',
    location: { latitude: 48.8576, longitude: 2.3532 },
    distance: 200,
    address: 'Rue de Rivoli, 75001 Paris',
    openingHours: '24h/24',
    description: 'Parking souterrain',
    amenities: ['payant', 'surveillé'],
  },
  {
    id: '3',
    name: 'Wi-Fi gratuit - Hôtel de Ville',
    type: 'wifi',
    location: { latitude: 48.8563, longitude: 2.3522 },
    distance: 300,
    address: 'Place de l\'Hôtel de Ville, 75004 Paris',
    openingHours: '24h/24',
    description: 'Réseau Wi-Fi public gratuit',
    amenities: ['gratuit', 'haut débit'],
  },
];

export default api;
