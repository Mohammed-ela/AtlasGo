import React from 'react';
import { Marker } from 'react-native-maps';
import { View, Text } from 'react-native';
import { POI } from '@/types';

interface POIMarkerProps {
  poi: POI;
  onPress: () => void;
}

const POIMarker: React.FC<POIMarkerProps> = ({ poi, onPress }) => {
  const getMarkerColor = (type: POI['type']) => {
    switch (type) {
      case 'toilet':
        return '#0A66C2'; // Bleu pour toilettes
      case 'parking':
        return '#D4A017'; // Or pour parking
      case 'wifi':
        return '#10B981'; // Vert pour Wi-Fi
      default:
        return '#6B7280'; // Gris par défaut
    }
  };

  const getMarkerIcon = (type: POI['type']) => {
    switch (type) {
      case 'toilet':
        return '🚻';
      case 'parking':
        return '🅿️';
      case 'wifi':
        return '📶';
      default:
        return '📍';
    }
  };

  return (
    <Marker
      coordinate={poi.location}
      title={poi.name}
      description={poi.description || `${poi.type} - ${poi.distance ? `${Math.round(poi.distance)}m` : ''}`}
      onPress={onPress}
      pinColor={getMarkerColor(poi.type)}
    >
      {/* Custom marker avec emoji */}
      <MarkerContent
        icon={getMarkerIcon(poi.type)}
        color={getMarkerColor(poi.type)}
      />
    </Marker>
  );
};

interface MarkerContentProps {
  icon: string;
  color: string;
}

const MarkerContent: React.FC<MarkerContentProps> = ({ icon, color }) => {
  return (
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: color,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      }}
    >
      <Text style={{ fontSize: 20 }}>{icon}</Text>
    </View>
  );
};

export default POIMarker;
