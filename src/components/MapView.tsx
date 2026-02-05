import React, { useRef, useEffect, useState } from 'react';
import MapView, { Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useMapStore } from '@/store/useMapStore';
import { POI, Cluster } from '@/types';
import POIMarker from './POIMarker';
import ClusterMarker from './ClusterMarker';

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
    mapRegion,
    isLoading,
  } = useMapStore();

  // Centrer la carte sur la position de l'utilisateur
  useEffect(() => {
    if (userLocation && mapReady) {
      mapRef.current?.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  }, [userLocation, mapReady]);

  const handleRegionChangeComplete = (region: Region) => {
    onRegionChange(region);
  };

  const handleMarkerPress = (poi: POI) => {
    onPOISelect(poi);
  };

  const handleClusterPress = (cluster: Cluster) => {
    // Zoom sur le cluster
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: cluster.location.latitude,
        longitude: cluster.location.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 500);
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
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        mapType="standard"
        loadingEnabled={isLoading}
        loadingIndicatorColor="#0A66C2"
        loadingBackgroundColor="#F7F9FC"
      >
        {clusters.map((cluster) => (
          <ClusterMarker
            key={cluster.id}
            cluster={cluster}
            onPress={() => handleClusterPress(cluster)}
          />
        ))}

        {clusters.length === 0 && pois.map((poi) => (
          <POIMarker
            key={poi.id}
            poi={poi}
            onPress={() => handleMarkerPress(poi)}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: width,
    height: height,
  },
});

export default MapViewComponent;
