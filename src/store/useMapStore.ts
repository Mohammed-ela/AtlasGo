import { create } from 'zustand';
import { MapState, POI, Location, FilterState, Cluster } from '@/types';

interface MapStore extends MapState {
  setUserLocation: (location: Location | null) => void;
  setPOIs: (pois: POI[]) => void;
  setClusters: (clusters: Cluster[]) => void;
  setSelectedPOI: (poi: POI | null) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setMapRegion: (region: MapState['mapRegion']) => void;
  clearError: () => void;
  reset: () => void;
}

const defaultFilters: FilterState = {
  toilet: true,
  parking: true,
  wifi: true,
};

const defaultMapRegion = {
  latitude: 48.8566,
  longitude: 2.3522,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

function buildClusters(pois: POI[], threshold: number = 0.001): Cluster[] {
  if (pois.length <= 50) return [];

  const visited = new Set<number>();
  const clusters: Cluster[] = [];

  for (let i = 0; i < pois.length; i++) {
    if (visited.has(i)) continue;

    const group: POI[] = [pois[i]];
    visited.add(i);

    for (let j = i + 1; j < pois.length; j++) {
      if (visited.has(j)) continue;
      const dLat = Math.abs(pois[i].location.latitude - pois[j].location.latitude);
      const dLng = Math.abs(pois[i].location.longitude - pois[j].location.longitude);
      if (dLat < threshold && dLng < threshold) {
        group.push(pois[j]);
        visited.add(j);
      }
    }

    if (group.length >= 3) {
      const avgLat = group.reduce((s, p) => s + p.location.latitude, 0) / group.length;
      const avgLng = group.reduce((s, p) => s + p.location.longitude, 0) / group.length;
      clusters.push({
        id: `cluster_${i}`,
        location: { latitude: avgLat, longitude: avgLng },
        count: group.length,
        points: group,
      });
    }
  }

  return clusters;
}

export const useMapStore = create<MapStore>((set, get) => ({
  userLocation: null,
  pois: [],
  clusters: [],
  selectedPOI: null,
  filters: defaultFilters,
  isLoading: false,
  error: null,
  mapRegion: defaultMapRegion,

  setUserLocation: (location) => set({ userLocation: location }),

  setPOIs: (pois) => {
    const clusters = buildClusters(pois);
    set({ pois, clusters });
  },

  setClusters: (clusters) => set({ clusters }),

  setSelectedPOI: (poi) => set({ selectedPOI: poi }),

  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  setMapRegion: (region) => set({ mapRegion: region }),

  clearError: () => set({ error: null }),

  reset: () => set({
    userLocation: null,
    pois: [],
    clusters: [],
    selectedPOI: null,
    filters: defaultFilters,
    isLoading: false,
    error: null,
    mapRegion: defaultMapRegion,
  }),
}));
