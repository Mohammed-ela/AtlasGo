import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '@/store/useThemeStore';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Rechercher un lieu..." 
}) => {
  const [query, setQuery] = useState('');
  const { isDark } = useThemeStore();

  const handleSearch = () => {
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <View className="px-4 py-2">
      <View
        className={`flex-row items-center px-4 py-3 rounded-2xl border ${
          isDark
            ? 'bg-dark-bg/80 border-gray-600'
            : 'bg-white/80 border-gray-300'
        }`}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Ionicons
          name="search"
          size={20}
          color={isDark ? '#E6EAF2' : '#6B7280'}
          style={{ marginRight: 12 }}
        />
        
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          className={`flex-1 text-base ${
            isDark ? 'text-light-text' : 'text-dark-text'
          }`}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} className="ml-2">
            <Ionicons
              name="close-circle"
              size={20}
              color={isDark ? '#9CA3AF' : '#6B7280'}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SearchBar;
