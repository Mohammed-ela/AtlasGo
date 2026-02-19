import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, StatusBar, Alert, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
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
import { colors } from '@/theme/tokens';

const AtlasGoApp: React.FC = () => {
  const {
    userLocation,
    pois,
    selectedPOI,
    filters,
    isLoading,
    setUserLocation,
    setPOIs,
    setSelectedPOI,
    setLoading,
    setError,
    clearError,
  } = useMapStore();

  const { initializeTheme } = useThemeStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [showToast, setShowToast] = useState(false);
  const regionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFetchRef = useRef<string>('');

  useEffect(() => {
    const subscription = initializeTheme();
    setIsInitialized(true);

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [initializeTheme]);

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
          const defaultLocation = locationService.getDefaultLocation();
          setUserLocation(defaultLocation);
          await loadNearbyPlaces(defaultLocation);

          if (result.error) {
            Alert.alert(
              'Geolocalisation',
              'Position par defaut utilisee. Activez la geolocalisation dans les parametres.',
              [{ text: 'OK' }]
            );
          }
        }
      } catch (err) {
        console.error('Erreur init:', err);
        setError("Erreur lors de l'initialisation");
      } finally {
        setLoading(false);
      }
    };

    requestLocation();
  }, [isInitialized]);

  const loadNearbyPlaces = async (location: { latitude: number; longitude: number }, showLoading = true) => {
    const key = `${location.latitude.toFixed(3)}_${location.longitude.toFixed(3)}`;
    if (key === lastFetchRef.current && !showLoading) return;

    try {
      if (showLoading) setLoading(true);
      clearError();

      const activeTypes = Object.entries(filters)
        .filter(([_, isActive]) => isActive)
        .map(([type]) => type);

      if (activeTypes.length === 0) {
        setPOIs([]);
        return;
      }

      try {
        const response = await placesApi.getPlaces({
          lat: location.latitude,
          lng: location.longitude,
          radius_m: 2000,
          types: activeTypes,
        });
        setPOIs(response.places);
        lastFetchRef.current = key;
      } catch {
        const filteredMock = mockPlaces.filter(poi => activeTypes.includes(poi.type));
        setPOIs(filteredMock);
      }
    } catch (err) {
      console.error('Erreur chargement POI:', err);
      setError('Impossible de charger les lieux');
    } finally {
      if (showLoading) setLoading(false);
      if (isFirstLoad) setIsFirstLoad(false);
    }
  };

  const handleRegionChange = useCallback((region: any) => {
    if (!userLocation) return;

    if (regionDebounceRef.current) {
      clearTimeout(regionDebounceRef.current);
    }

    regionDebounceRef.current = setTimeout(() => {
      loadNearbyPlaces({
        latitude: region.latitude,
        longitude: region.longitude,
      }, false);
    }, 800);
  }, [userLocation, filters]);

  const handlePOISelect = (poi: any) => {
    setSelectedPOI(poi);
  };

  const handleCloseDetails = () => {
    setSelectedPOI(null);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      if (userLocation) {
        await loadNearbyPlaces(userLocation);
      }
      return;
    }

    if (userLocation) {
      try {
        const results = await placesApi.searchPlaces(query, userLocation);
        if (results.length > 0) {
          setPOIs(results);
          return;
        }
      } catch {}
    }

    const filtered = pois.filter(poi =>
      poi.name.toLowerCase().includes(query.toLowerCase()) ||
      poi.address?.toLowerCase().includes(query.toLowerCase())
    );
    setPOIs(filtered);
  };

  const handleFilterChange = async () => {
    if (userLocation) {
      await loadNearbyPlaces(userLocation);
    }
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <View style={styles.container}>
          <LinearGradient
            colors={[colors.background, '#0E1420']}
            style={StyleSheet.absoluteFill}
          />

          <MapViewComponent
            onPOISelect={handlePOISelect}
            onRegionChange={handleRegionChange}
          />

          {/* Top overlay: Search + Filters */}
          <SafeAreaView
            edges={['top']}
            style={styles.topOverlay}
            pointerEvents="box-none"
          >
            <View pointerEvents="box-none">
              <SearchBar onSearch={handleSearch} />
              <FilterChips onFilterChange={handleFilterChange} />
            </View>
          </SafeAreaView>

          <POIDetailsSheet
            poi={selectedPOI}
            onClose={handleCloseDetails}
          />

          {isLoading && isFirstLoad && <LoadingOverlay />}

          <Toast
            message={toastMessage}
            type={toastType}
            visible={showToast}
            onHide={() => setShowToast(false)}
          />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});

export default AtlasGoApp;
