import React, { useRef, useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import MapView, { Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useMapStore } from '@/store/useMapStore';
import { POI, Cluster } from '@/types';
import POIMarker from './POIMarker';
import ClusterMarker from './ClusterMarker';
import mapStyle from '@/theme/mapStyle.json';
import { colors, radius, blur, shadows, spacing } from '@/theme/tokens';

const { width, height } = Dimensions.get('window');

interface MapViewComponentProps {
  onPOISelect: (poi: POI) => void;
  onRegionChange: (region: Region) => void;
}

const MapViewComponent: React.FC<MapViewComponentProps> = ({
  onPOISelect,
  onRegionChange,
}) => {
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);

  const {
    userLocation,
    pois,
    clusters,
    selectedPOI,
    mapRegion,
    isLoading,
  } = useMapStore();

  useEffect(() => {
    if (userLocation && mapReady) {
      mapRef.current?.animateCamera(
        {
          center: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          },
          zoom: 15,
        },
        { duration: 1000 }
      );
    }
  }, [userLocation, mapReady]);

  const handleRegionChangeComplete = (region: Region) => {
    onRegionChange(region);
  };

  const handleMarkerPress = (poi: POI) => {
    onPOISelect(poi);
  };

  const handleClusterPress = (cluster: Cluster) => {
    if (mapRef.current) {
      mapRef.current.animateCamera(
        {
          center: {
            latitude: cluster.location.latitude,
            longitude: cluster.location.longitude,
          },
          zoom: 17,
        },
        { duration: 500 }
      );
    }
  };

  const handleLocatePress = () => {
    if (userLocation && mapRef.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      mapRef.current.animateCamera(
        {
          center: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          },
          zoom: 15,
        },
        { duration: 800 }
      );
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={mapRegion}
        onRegionChangeComplete={handleRegionChangeComplete}
        onMapReady={() => setMapReady(true)}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        mapType="standard"
        customMapStyle={mapStyle}
        loadingEnabled={isLoading}
        loadingIndicatorColor={colors.primary}
        loadingBackgroundColor={colors.background}
      >
        {clusters.map((cluster) => (
          <ClusterMarker
            key={cluster.id}
            cluster={cluster}
            onPress={() => handleClusterPress(cluster)}
          />
        ))}

        {clusters.length === 0 &&
          pois.map((poi) => (
            <POIMarker
              key={poi.id}
              poi={poi}
              onPress={() => handleMarkerPress(poi)}
              isSelected={selectedPOI?.id === poi.id}
            />
          ))}
      </MapView>

      {/* Custom locate button */}
      <View style={styles.locateButtonContainer}>
        <TouchableOpacity
          onPress={handleLocatePress}
          activeOpacity={0.8}
          style={styles.locateButtonOuter}
        >
          <BlurView
            intensity={blur.medium}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.locateButtonInner, shadows.sm]}>
            <Ionicons name="locate" size={22} color={colors.primary} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width,
    height,
  },
  locateButtonContainer: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 120,
  },
  locateButtonOuter: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  locateButtonInner: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.glass.bg,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
});

export default MapViewComponent;
