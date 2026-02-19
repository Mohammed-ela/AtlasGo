import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { POI } from '@/types';
import { colors, shadows } from '@/theme/tokens';

interface POIMarkerProps {
  poi: POI;
  onPress: () => void;
  isSelected?: boolean;
}

const MARKER_SIZE = 44;
const PIN_HEIGHT = 8;

const getIconName = (type: POI['type']): keyof typeof MaterialCommunityIcons.glyphMap => {
  switch (type) {
    case 'toilet':
      return 'toilet';
    case 'parking':
      return 'parking';
    case 'wifi':
      return 'wifi';
    default:
      return 'map-marker';
  }
};

const getGradient = (type: POI['type']): [string, string] => {
  return colors.poiGradient[type] || ['#6B7592', '#4A5568'];
};

const getColor = (type: POI['type']): string => {
  return colors.poi[type] || '#6B7592';
};

const POIMarker: React.FC<POIMarkerProps> = ({ poi, onPress, isSelected }) => {
  const scale = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  }, []);

  useEffect(() => {
    if (isSelected) {
      pulseScale.value = withRepeat(
        withSequence(
          withSpring(1.08, { damping: 8, stiffness: 120 }),
          withSpring(1, { damping: 8, stiffness: 120 })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withSpring(1);
    }
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulseScale.value }],
  }));

  const gradient = getGradient(poi.type);
  const color = getColor(poi.type);

  return (
    <Marker
      coordinate={poi.location}
      onPress={onPress}
      anchor={{ x: 0.5, y: 1 }}
      tracksViewChanges={false}
    >
      <Animated.View style={[styles.wrapper, animatedStyle]}>
        <View style={[styles.markerContainer, shadows.glow(color)]}>
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.circle}
          >
            <MaterialCommunityIcons
              name={getIconName(poi.type)}
              size={22}
              color={colors.white}
            />
          </LinearGradient>
        </View>
        {/* Pin pointer */}
        <View style={styles.pinContainer}>
          <View
            style={[
              styles.pin,
              { borderTopColor: gradient[1] },
            ]}
          />
        </View>
      </Animated.View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  markerContainer: {
    borderRadius: MARKER_SIZE / 2,
  },
  circle: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  pinContainer: {
    alignItems: 'center',
    marginTop: -2,
  },
  pin: {
    width: 0,
    height: 0,
    borderLeftWidth: PIN_HEIGHT,
    borderRightWidth: PIN_HEIGHT,
    borderTopWidth: PIN_HEIGHT + 2,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.white,
  },
});

export default POIMarker;
