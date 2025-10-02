import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useThemeStore } from '@/store/useThemeStore';

const LoadingOverlay: React.FC = () => {
  const { isDark } = useThemeStore();

  return (
    <View
      className="absolute inset-0 items-center justify-center"
      style={{
        backgroundColor: isDark ? 'rgba(11, 18, 32, 0.8)' : 'rgba(247, 249, 252, 0.8)',
      }}
    >
      <View
        className="bg-white dark:bg-gray-800 px-6 py-4 rounded-2xl items-center"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <ActivityIndicator
          size="large"
          color="#0A66C2"
          style={{ marginBottom: 12 }}
        />
        <Text
          className={`text-base font-medium ${
            isDark ? 'text-light-text' : 'text-dark-text'
          }`}
        >
          Chargement des lieux...
        </Text>
      </View>
    </View>
  );
};

export default LoadingOverlay;
