import React, { useEffect, useState } from 'react';
import { View, StatusBar, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useMapStore } from '@/store/useMapStore';
import { useThemeStore } from '@/store/useThemeStore';
import { locationService } from '@/services/location';
import { placesApi, mockPlaces } from '@/services/api';
import MapViewComponent from './MapView';
import SearchBar from './SearchBar';
import FilterChips from './FilterChips';
import POIDetailsSheet from './POIDetailsSheet';
import LoadingOverlay from './LoadingOverlay';
import Toast from './Toast';

const AtlasGoApp: React.FC = () => {
  const {
    userLocation,
    pois,
    selectedPOI,
    filters,
    isLoading,
    error,
    setUserLocation,
    setPOIs,
    setSelectedPOI,
    setLoading,
    setError,
    clearError,
    mapRegion,
  } = useMapStore();

  const { isDark, initializeTheme } = useThemeStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [showToast, setShowToast] = useState(false);

  // Initialiser le thème
  useEffect(() => {
    const subscription = initializeTheme();
    setIsInitialized(true);
    
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [initializeTheme]);

  // Demander la géolocalisation au démarrage
  useEffect(() => {
    if (!isInitialized) return;

    const requestLocation = async () => {
      setLoading(true);
      
      try {
        const result = await locationService.requestLocation();
        
        if (result.granted && result.location) {
          setUserLocation(result.location);
          await loadNearbyPlaces(result.location);
        } else {
          // Utiliser la position par défaut (Paris)
          const defaultLocation = locationService.getDefaultLocation();
          setUserLocation(defaultLocation);
          await loadNearbyPlaces(defaultLocation);
          
          if (result.error) {
            Alert.alert(
              'Géolocalisation',
              'Position par défaut utilisée. Vous pouvez activer la géolocalisation dans les paramètres.',
              [{ text: 'OK' }]
            );
          }
        }
      } catch (error) {
        console.error('Erreur initialisation:', error);
        setError('Erreur lors de l\'initialisation');
      } finally {
        setLoading(false);
      }
    };

    requestLocation();
  }, [isInitialized]);

  // Charger les POI à proximité
  const loadNearbyPlaces = async (location: { latitude: number; longitude: number }) => {
    try {
      setLoading(true);
      clearError();

      // Récupérer les types de filtres actifs
      const activeTypes = Object.entries(filters)
        .filter(([_, isActive]) => isActive)
        .map(([type, _]) => type);

      if (activeTypes.length === 0) {
        setPOIs([]);
        return;
      }

      try {
        // Essayer l'API en premier
        const response = await placesApi.getPlaces({
          lat: location.latitude,
          lng: location.longitude,
          radius_m: 1000,
          types: activeTypes,
        });

        setPOIs(response.places);
      } catch (apiError) {
        console.warn('API indisponible, utilisation des données mock:', apiError);
        // Fallback sur les données mock
        const filteredMockPlaces = mockPlaces.filter(poi => 
          activeTypes.includes(poi.type)
        );
        setPOIs(filteredMockPlaces);
      }
    } catch (error) {
      console.error('Erreur chargement POI:', error);
      setError('Impossible de charger les lieux');
    } finally {
      setLoading(false);
    }
  };

  // Gérer le changement de région de la carte
  const handleRegionChange = async (region: any) => {
    if (userLocation) {
      await loadNearbyPlaces({
        latitude: region.latitude,
        longitude: region.longitude,
      });
    }
  };

  // Gérer la sélection d'un POI
  const handlePOISelect = (poi: any) => {
    setSelectedPOI(poi);
  };

  // Gérer la fermeture de la bottom sheet
  const handleCloseDetails = () => {
    setSelectedPOI(null);
  };

  // Gérer la recherche
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      // Recharger les POI normaux
      if (userLocation) {
        await loadNearbyPlaces(userLocation);
      }
      return;
    }

    // Implémentation de la recherche (pour l'instant, filtre local)
    const filteredPOIs = pois.filter(poi =>
      poi.name.toLowerCase().includes(query.toLowerCase()) ||
      poi.address?.toLowerCase().includes(query.toLowerCase())
    );
    setPOIs(filteredPOIs);
  };

  // Gérer le changement de filtres
  const handleFilterChange = async () => {
    if (userLocation) {
      await loadNearbyPlaces(userLocation);
    }
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={isDark ? '#0B1220' : '#F7F9FC'}
        />
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: isDark ? '#0B1220' : '#F7F9FC',
          }}
        >
          <View className="flex-1">
            {/* Carte principale */}
            <MapViewComponent
              onPOISelect={handlePOISelect}
              onRegionChange={handleRegionChange}
            />

            {/* Overlay de recherche et filtres */}
            <View
              className="absolute top-0 left-0 right-0"
              style={{
                backgroundColor: 'transparent',
              }}
            >
              <SearchBar onSearch={handleSearch} />
              <FilterChips onFilterChange={handleFilterChange} />
            </View>

            {/* Bottom sheet pour les détails */}
            <POIDetailsSheet
              poi={selectedPOI}
              onClose={handleCloseDetails}
            />

            {/* Overlay de chargement */}
            {isLoading && <LoadingOverlay />}

            {/* Toast notifications */}
            <Toast
              message={toastMessage}
              type={toastType}
              visible={showToast}
              onHide={() => setShowToast(false)}
            />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default AtlasGoApp;
