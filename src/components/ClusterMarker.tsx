import React from 'react';
import { Marker } from 'react-native-maps';
import { View, Text } from 'react-native';
import { Cluster } from '@/types';

interface ClusterMarkerProps {
  cluster: Cluster;
  onPress: () => void;
}

const ClusterMarker: React.FC<ClusterMarkerProps> = ({ cluster, onPress }) => {
  const getClusterColor = (count: number) => {
    if (count < 10) return '#0A66C2';
    if (count < 50) return '#D4A017';
    return '#EF4444';
  };

  const getClusterSize = (count: number) => {
    if (count < 10) return 30;
    if (count < 50) return 40;
    return 50;
  };

  const size = getClusterSize(cluster.count);
  const color = getClusterColor(cluster.count);

  return (
    <Marker
      coordinate={cluster.location}
      onPress={onPress}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
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
        <Text
          style={{
            color: 'white',
            fontSize: size < 40 ? 12 : 16,
            fontWeight: 'bold',
          }}
        >
          {cluster.count}
        </Text>
      </View>
    </Marker>
  );
};

export default ClusterMarker;
