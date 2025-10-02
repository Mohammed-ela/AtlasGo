export interface Location {
  latitude: number;
  longitude: number;
}

export interface POI {
  id: string;
  name: string;
  type: 'toilet' | 'parking' | 'wifi';
  location: Location;
  distance?: number;
  address?: string;
  openingHours?: string;
  description?: string;
  amenities?: string[];
}

export interface Cluster {
  id: string;
  location: Location;
  count: number;
  points: POI[];
}

export interface FilterState {
  toilets: boolean;
  parking: boolean;
  wifi: boolean;
}

export interface MapState {
  userLocation: Location | null;
  pois: POI[];
  clusters: Cluster[];
  selectedPOI: POI | null;
  filters: FilterState;
  isLoading: boolean;
  error: string | null;
  mapRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

export interface ThemeState {
  isDark: boolean;
  systemTheme: 'light' | 'dark' | 'auto';
}

export type POIType = 'toilet' | 'parking' | 'wifi';

export interface APIResponse {
  places: POI[];
  total: number;
  cached: boolean;
}
