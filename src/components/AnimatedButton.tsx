import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, radius, blur, shadows, spacing, animation } from '@/theme/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
}

const SIZE_MAP: Record<ButtonSize, { height: number; paddingHorizontal: number; fontSize: number }> = {
  sm: { height: 44, paddingHorizontal: spacing.lg, fontSize: 14 },
  md: { height: 52, paddingHorizontal: spacing.xl, fontSize: 16 },
  lg: { height: 60, paddingHorizontal: spacing.xxl, fontSize: 16 },
};

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  style,
}) => {
  const scale = useSharedValue(1);
  const sizeConfig = SIZE_MAP[size];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, animation.spring);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, animation.spring);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const renderContent = () => {
    const textStyle: TextStyle = {
      fontSize: sizeConfig.fontSize,
      fontWeight: '600',
      color: variant === 'primary' ? colors.white : colors.text.secondary,
    };

    return (
      <>
        {icon && <>{icon}</>}
        <Text style={textStyle}>{title}</Text>
      </>
    );
  };

  if (variant === 'primary') {
    return (
      <Animated.View style={[animatedStyle, style]}>
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          disabled={disabled}
          style={{ borderRadius: radius.lg, overflow: 'hidden', opacity: disabled ? 0.5 : 1 }}
        >
          <LinearGradient
            colors={['#2B8DFF', '#0066DD']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.button,
              {
                height: sizeConfig.height,
                paddingHorizontal: sizeConfig.paddingHorizontal,
              },
              shadows.glow(colors.primary),
            ]}
          >
            {renderContent()}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (variant === 'secondary') {
    return (
      <Animated.View style={[animatedStyle, style]}>
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
          disabled={disabled}
          style={[styles.secondaryOuter, { opacity: disabled ? 0.5 : 1 }]}
        >
          <BlurView intensity={blur.light} tint="dark" style={StyleSheet.absoluteFill} />
          <Animated.View
            style={[
              styles.button,
              styles.secondaryInner,
              {
                height: sizeConfig.height,
                paddingHorizontal: sizeConfig.paddingHorizontal,
              },
            ]}
          >
            {renderContent()}
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // ghost
  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.6}
        disabled={disabled}
        style={{ opacity: disabled ? 0.5 : 1 }}
      >
        <Animated.View
          style={[
            styles.button,
            {
              height: sizeConfig.height,
              paddingHorizontal: sizeConfig.paddingHorizontal,
              backgroundColor: 'transparent',
            },
          ]}
        >
          {renderContent()}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  secondaryOuter: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  secondaryInner: {
    backgroundColor: colors.glass.bg,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
});

export default AnimatedButton;
