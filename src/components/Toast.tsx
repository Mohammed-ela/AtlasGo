import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, blur, radius, spacing, typography, animation } from '@/theme/tokens';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

const getToastConfig = (type: string) => {
  switch (type) {
    case 'success':
      return { color: colors.success, icon: 'checkmark-circle' as const };
    case 'error':
      return { color: colors.error, icon: 'alert-circle' as const };
    default:
      return { color: colors.info, icon: 'information-circle' as const };
  }
};

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  visible,
  onHide,
  duration = 3000,
}) => {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, animation.spring);
      opacity.value = withTiming(1, { duration: 200 });

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible, duration]);

  const hideToast = () => {
    translateY.value = withTiming(-100, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onHide)();
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  const config = getToastConfig(type);

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]}>
      <View style={styles.container}>
        <BlurView
          intensity={blur.medium + 10}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.inner, { borderLeftColor: config.color }]}>
          <Ionicons
            name={config.icon}
            size={20}
            color={config.color}
            style={styles.icon}
          />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  container: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.glass.bg,
    borderWidth: 1,
    borderColor: colors.glass.border,
    borderRadius: radius.lg,
    borderLeftWidth: 4,
  },
  icon: {
    marginRight: spacing.md,
  },
  message: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
});

export default Toast;
