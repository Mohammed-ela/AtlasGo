import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMapStore } from '@/store/useMapStore';
import { colors, radius, blur, shadows, spacing, animation } from '@/theme/tokens';

interface FilterChipsProps {
  onFilterChange: () => void;
}

const FILTER_OPTIONS = [
  {
    key: 'toilet' as const,
    label: 'Toilettes',
    icon: 'toilet' as const,
    color: colors.poi.toilet,
    gradient: colors.poiGradient.toilet,
  },
  {
    key: 'parking' as const,
    label: 'Parking',
    icon: 'parking' as const,
    color: colors.poi.parking,
    gradient: colors.poiGradient.parking,
  },
  {
    key: 'wifi' as const,
    label: 'Wi-Fi',
    icon: 'wifi' as const,
    color: colors.poi.wifi,
    gradient: colors.poiGradient.wifi,
  },
];

const FilterChip: React.FC<{
  option: (typeof FILTER_OPTIONS)[number];
  isActive: boolean;
  onPress: () => void;
}> = ({ option, isActive, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.92, { damping: 10, stiffness: 300 }),
      withSpring(isActive ? 1 : 1.05, animation.springBouncy)
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={styles.chipTouchable}
      >
        {isActive ? (
          <LinearGradient
            colors={option.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.chipActive, shadows.glow(option.color)]}
          >
            <MaterialCommunityIcons
              name={option.icon}
              size={18}
              color={colors.white}
              style={styles.chipIcon}
            />
            <Text style={styles.chipLabelActive}>{option.label}</Text>
          </LinearGradient>
        ) : (
          <View style={styles.chipInactiveOuter}>
            <BlurView
              intensity={blur.light}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.chipInactiveInner}>
              <MaterialCommunityIcons
                name={option.icon}
                size={18}
                color={option.color}
                style={styles.chipIcon}
              />
              <Text style={styles.chipLabelInactive}>{option.label}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const FilterChips: React.FC<FilterChipsProps> = ({ onFilterChange }) => {
  const { filters, setFilters } = useMapStore();

  const handleFilterToggle = (filterKey: keyof typeof filters) => {
    setFilters({ [filterKey]: !filters[filterKey] });
    onFilterChange();
  };

  return (
    <View style={styles.container}>
      {FILTER_OPTIONS.map((option) => (
        <FilterChip
          key={option.key}
          option={option}
          isActive={filters[option.key]}
          onPress={() => handleFilterToggle(option.key)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chipTouchable: {
    borderRadius: radius.xxl,
    overflow: 'hidden',
  },
  chipActive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.xxl,
  },
  chipInactiveOuter: {
    borderRadius: radius.xxl,
    overflow: 'hidden',
  },
  chipInactiveInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.glass.bg,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  chipIcon: {
    marginRight: spacing.xs,
  },
  chipLabelActive: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  chipLabelInactive: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
});

export default FilterChips;
