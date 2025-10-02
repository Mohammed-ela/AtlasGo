import { create } from 'zustand';
import { MapState, POI, Location, FilterState, Cluster } from '@/types';

interface MapStore extends MapState {
  // Actions
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
  toilets: true,
  parking: true,
  wifi: true,
};

const defaultMapRegion = {
  latitude: 48.8566, // Paris par défaut
  longitude: 2.3522,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export const useMapStore = create<MapStore>((set, get) => ({
  // État initial
  userLocation: null,
  pois: [],
  clusters: [],
  selectedPOI: null,
  filters: defaultFilters,
  isLoading: false,
  error: null,
  mapRegion: defaultMapRegion,

  // Actions
  setUserLocation: (location) => set({ userLocation: location }),
  
  setPOIs: (pois) => {
    set({ pois });
    // Recalculer les clusters si nécessaire
    const { clusters } = get();
    if (pois.length > 100) {
      // Logique de clustering sera implémentée plus tard
      set({ clusters: [] });
    } else {
      set({ clusters: [] });
    }
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
