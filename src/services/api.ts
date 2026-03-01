import { POI, APIResponse, Location } from '@/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://atlasgo.onrender.com';

interface RawPOI {
  id: string;
  name: string;
  type: string;
  location: Location;
  distance?: number;
  address?: string;
  opening_hours?: string;
  openingHours?: string;
  description?: string;
  amenities?: string[];
}

interface RawPlacesResponse {
  places: RawPOI[];
  total: number;
  cached: boolean;
}

async function apiFetch<T>(endpoint: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

export interface PlacesParams {
  lat: number;
  lng: number;
  radius_m: number;
  types: string[];
}

function mapPOI(raw: RawPOI): POI {
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

    const data = await apiFetch<RawPlacesResponse>(
      `/places?lat=${lat}&lng=${lng}&radius_m=${radius_m}&types=${typesParam}`
    );

    return {
      places: (data.places ?? []).map(mapPOI),
      total: data.total ?? 0,
      cached: data.cached,
    };
  },

  searchPlaces: async (query: string, location: Location): Promise<POI[]> => {
    try {
      const data = await apiFetch<RawPOI[]>(
        `/search?q=${encodeURIComponent(query)}&lat=${location.latitude}&lng=${location.longitude}`
      );
      return (data ?? []).map(mapPOI);
    } catch {
      return [];
    }
  },
};

export default apiFetch;
