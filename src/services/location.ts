import * as Location from 'expo-location';
import { Location as LocationType } from '@/types';

export interface LocationPermissionResult {
  granted: boolean;
  location?: LocationType;
  error?: string;
}

export const locationService = {
  requestLocation: async (): Promise<LocationPermissionResult> => {
    try {
      let { status } = await Location.getForegroundPermissionsAsync();

      if (status !== 'granted') {
        const permissionResponse = await Location.requestForegroundPermissionsAsync();
        status = permissionResponse.status;

        if (status !== 'granted') {
          return {
            granted: false,
            error: 'Permission de geolocalisation refusee',
          };
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        granted: true,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      };
    } catch (err) {
      console.error('Erreur geoloc:', err);
      return {
        granted: false,
        error: 'Impossible de recuperer votre position',
      };
    }
  },

  getCurrentLocation: async (): Promise<LocationType | null> => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();

      if (status !== 'granted') {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch {
      return null;
    }
  },

  getDefaultLocation: (): LocationType => ({
    latitude: 48.8566,
    longitude: 2.3522,
  }),

  calculateDistance: (point1: LocationType, point2: LocationType): number => {
    const R = 6371e3;
    const p1 = (point1.latitude * Math.PI) / 180;
    const p2 = (point2.latitude * Math.PI) / 180;
    const dp = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const dl = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(dp / 2) * Math.sin(dp / 2) +
      Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  },
};
