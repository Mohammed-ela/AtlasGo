import * as Location from 'expo-location';
import { Location as LocationType } from '@/types';

export interface LocationPermissionResult {
  granted: boolean;
  location?: LocationType;
  error?: string;
}

export const locationService = {
  /**
   * Demande la permission de géolocalisation et récupère la position
   */
  requestLocation: async (): Promise<LocationPermissionResult> => {
    try {
      // Vérifier si la permission est déjà accordée
      let { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        // Demander la permission
        const permissionResponse = await Location.requestForegroundPermissionsAsync();
        status = permissionResponse.status;
        
        if (status !== 'granted') {
          return {
            granted: false,
            error: 'Permission de géolocalisation refusée',
          };
        }
      }

      // Récupérer la position actuelle
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
      });

      return {
        granted: true,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      };
    } catch (error) {
      console.error('Erreur géolocalisation:', error);
      return {
        granted: false,
        error: 'Impossible de récupérer votre position',
      };
    }
  },

  /**
   * Récupère la position actuelle sans demander de permission
   */
  getCurrentLocation: async (): Promise<LocationType | null> => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 5000,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Erreur récupération position:', error);
      return null;
    }
  },

  /**
   * Position par défaut (Paris)
   */
  getDefaultLocation: (): LocationType => ({
    latitude: 48.8566,
    longitude: 2.3522,
  }),

  /**
   * Calcule la distance entre deux points (en mètres)
   */
  calculateDistance: (point1: LocationType, point2: LocationType): number => {
    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance en mètres
  },
};
