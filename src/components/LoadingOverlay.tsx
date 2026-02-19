import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { colors, blur, radius, spacing, typography } from '@/theme/tokens';

const DOT_COLORS = [colors.poi.toilet, colors.poi.parking, colors.poi.wifi];
const DOT_SIZE = 12;

const BouncingDot: React.FC<{ color: string; delay: number }> = ({ color, delay }) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-12, { duration: 300 }),
          withTiming(0, { duration: 300 })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
};

const LoadingOverlay: React.FC = () => {
  return (
    <View style={styles.overlay}>
      <BlurView
        intensity={blur.max}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, styles.overlayBg]} />

      <View style={styles.card}>
        <BlurView intensity={blur.medium} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.cardInner}>
          <View style={styles.dotsContainer}>
            {DOT_COLORS.map((color, index) => (
              <BouncingDot key={index} color={color} delay={index * 150} />
            ))}
          </View>
          <Text style={styles.text}>Chargement des lieux...</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  overlayBg: {
    backgroundColor: colors.overlay,
  },
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  cardInner: {
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    backgroundColor: colors.glass.bg,
    borderWidth: 1,
    borderColor: colors.glass.border,
    borderRadius: radius.xl,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
    height: 30,
    alignItems: 'center',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  text: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
  },
});

export default LoadingOverlay;
