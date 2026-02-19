import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radius as radiusTokens } from '@/theme/tokens';

interface GlassCardProps {
  children: React.ReactNode;
  intensity?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  intensity = 20,
  borderRadius = radiusTokens.lg,
  style,
}) => {
  return (
    <View style={[styles.container, { borderRadius }, style]}>
      <BlurView
        intensity={intensity}
        tint="dark"
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />
      <View
        style={[
          styles.inner,
          {
            borderRadius,
            backgroundColor: colors.glass.bg,
            borderColor: colors.glass.border,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  inner: {
    borderWidth: 1,
    overflow: 'hidden',
  },
});

export default GlassCard;
