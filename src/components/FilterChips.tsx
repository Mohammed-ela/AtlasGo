import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useMapStore } from '@/store/useMapStore';

import { Ionicons } from '@expo/vector-icons';

interface FilterChipsProps {
  onFilterChange: () => void;
}

const FilterChips: React.FC<FilterChipsProps> = ({ onFilterChange }) => {
  const { filters, setFilters } = useMapStore();

  const filterOptions = [
    {
      key: 'toilet' as keyof typeof filters,
      label: 'Toilettes',
      icon: 'water' as const,
      color: '#0A66C2',
    },
    {
      key: 'parking' as keyof typeof filters,
      label: 'Parking',
      icon: 'car' as const,
      color: '#D4A017',
    },
    {
      key: 'wifi' as keyof typeof filters,
      label: 'Wi-Fi',
      icon: 'wifi' as const,
      color: '#10B981',
    },
  ];

  const handleFilterToggle = (filterKey: keyof typeof filters) => {
    setFilters({ [filterKey]: !filters[filterKey] });
    onFilterChange();
  };

  return (
    <View className="flex-row flex-wrap px-4 py-2 gap-2">
      {filterOptions.map((option) => (
        <TouchableOpacity
          key={option.key}
          onPress={() => handleFilterToggle(option.key)}
          className={`flex-row items-center px-4 py-2 rounded-2xl border-2 ${
            filters[option.key]
              ? 'bg-primary-500 border-primary-500'
              : 'bg-white/80 border-gray-300'
          }`}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <Ionicons
            name={option.icon}
            size={16}
            color={filters[option.key] ? 'white' : option.color}
            style={{ marginRight: 6 }}
          />
          <Text
            className={`text-sm font-medium ${
              filters[option.key] ? 'text-white' : 'text-gray-700'
            }`}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default FilterChips;
