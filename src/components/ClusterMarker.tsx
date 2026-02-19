import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Cluster } from '@/types';
import { colors, shadows } from '@/theme/tokens';

interface ClusterMarkerProps {
  cluster: Cluster;
  onPress: () => void;
}

const getClusterConfig = (count: number) => {
  if (count < 10) {
    return {
      gradient: ['#2B8DFF', '#0066DD'] as [string, string],
      color: colors.poi.toilet,
      size: 44,
    };
  }
  if (count < 50) {
    return {
      gradient: ['#FFB020', '#DD8800'] as [string, string],
      color: colors.poi.parking,
      size: 54,
    };
  }
  return {
    gradient: ['#FF4D6A', '#DD2244'] as [string, string],
    color: colors.error,
    size: 68,
  };
};

const ClusterMarker: React.FC<ClusterMarkerProps> = ({ cluster, onPress }) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 8, stiffness: 160 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const config = getClusterConfig(cluster.count);

  return (
    <Marker
      coordinate={cluster.location}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <Animated.View style={animatedStyle}>
        <View style={shadows.glow(config.color)}>
          <LinearGradient
            colors={config.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.cluster,
              {
                width: config.size,
                height: config.size,
                borderRadius: config.size / 2,
              },
            ]}
          >
            <Text
              style={[
                styles.count,
                { fontSize: config.size < 50 ? 14 : 18 },
              ]}
            >
              {cluster.count}
            </Text>
          </LinearGradient>
        </View>
      </Animated.View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  cluster: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.white,
  },
  count: {
    color: colors.white,
    fontWeight: '700',
  },
});

export default ClusterMarker;
