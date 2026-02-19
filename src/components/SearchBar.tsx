import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, blur, shadows, spacing, animation } from '@/theme/tokens';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Rechercher un lieu...',
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const scale = useSharedValue(1);
  const borderOpacity = useSharedValue(0);

  const animatedContainer = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedBorder = useAnimatedStyle(() => ({
    borderColor: `rgba(43, 141, 255, ${borderOpacity.value})`,
  }));

  const handleFocus = () => {
    setIsFocused(true);
    scale.value = withSpring(1.02, animation.spring);
    borderOpacity.value = withSpring(0.8, animation.spring);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleBlur = () => {
    setIsFocused(false);
    scale.value = withSpring(1, animation.spring);
    borderOpacity.value = withSpring(0, animation.spring);
  };

  const handleSearch = () => {
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.container, animatedContainer]}>
        <BlurView intensity={blur.medium} tint="dark" style={StyleSheet.absoluteFill} />
        <Animated.View
          style={[
            styles.inner,
            animatedBorder,
            isFocused && shadows.glow(colors.primary),
          ]}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={isFocused ? colors.primary : colors.text.tertiary}
            style={styles.searchIcon}
          />

          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            placeholderTextColor={colors.text.tertiary}
            style={styles.input}
            returnKeyType="search"
            selectionColor={colors.primary}
          />

          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear} hitSlop={8}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.text.tertiary}
              />
            </TouchableOpacity>
          )}
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  container: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.glass.bg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  searchIcon: {
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },
});

export default SearchBar;
