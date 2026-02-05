import React, { useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, Linking, Share } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { POI } from '@/types';
import { useThemeStore } from '@/store/useThemeStore';

interface POIDetailsSheetProps {
  poi: POI | null;
  onClose: () => void;
}

const POIDetailsSheet: React.FC<POIDetailsSheetProps> = ({ poi, onClose }) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { isDark } = useThemeStore();

  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

  React.useEffect(() => {
    if (poi) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [poi]);

  const handleClose = () => {
    bottomSheetRef.current?.close();
    onClose();
  };

  const handleDirections = async () => {
    if (!poi) return;

    const { latitude, longitude } = poi.location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Erreur ouverture navigation:', error);
    }
  };

  const handleShare = async () => {
    if (!poi) return;

    try {
      await Share.share({
        message: `Découvrez ${poi.name} à ${poi.address || 'cette adresse'}`,
        url: `https://www.google.com/maps?q=${poi.location.latitude},${poi.location.longitude}`,
      });
    } catch (error) {
      console.error('Erreur partage:', error);
    }
  };

  const getPOIIcon = (type: POI['type']) => {
    switch (type) {
      case 'toilet':
        return 'water';
      case 'parking':
        return 'car';
      case 'wifi':
        return 'wifi';
      default:
        return 'location';
    }
  };

  const getPOIColor = (type: POI['type']) => {
    switch (type) {
      case 'toilet':
        return '#0A66C2';
      case 'parking':
        return '#D4A017';
      case 'wifi':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  if (!poi) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onClose={handleClose}
      enablePanDownToClose
      backgroundStyle={{
        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      }}
      handleIndicatorStyle={{
        backgroundColor: isDark ? '#6B7280' : '#D1D5DB',
      }}
    >
      <BottomSheetView className="flex-1 px-6 py-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1">
            <View
              className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
              style={{ backgroundColor: getPOIColor(poi.type) }}
            >
              <Ionicons
                name={getPOIIcon(poi.type)}
                size={24}
                color="white"
              />
            </View>
            <View className="flex-1">
              <Text
                className={`text-lg font-bold ${
                  isDark ? 'text-light-text' : 'text-dark-text'
                }`}
                numberOfLines={2}
              >
                {poi.name}
              </Text>
              <Text
                className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {poi.distance ? `${Math.round(poi.distance)}m` : ''}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity onPress={handleClose}>
            <Ionicons
              name="close"
              size={24}
              color={isDark ? '#9CA3AF' : '#6B7280'}
            />
          </TouchableOpacity>
        </View>

        {/* Détails */}
        {poi.address && (
          <View className="mb-4">
            <Text
              className={`text-sm font-medium mb-1 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Adresse
            </Text>
            <Text
              className={`text-base ${
                isDark ? 'text-light-text' : 'text-dark-text'
              }`}
            >
              {poi.address}
            </Text>
          </View>
        )}

        {poi.openingHours && (
          <View className="mb-4">
            <Text
              className={`text-sm font-medium mb-1 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Horaires
            </Text>
            <Text
              className={`text-base ${
                isDark ? 'text-light-text' : 'text-dark-text'
              }`}
            >
              {poi.openingHours}
            </Text>
          </View>
        )}

        {poi.description && (
          <View className="mb-6">
            <Text
              className={`text-sm font-medium mb-1 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Description
            </Text>
            <Text
              className={`text-base ${
                isDark ? 'text-light-text' : 'text-dark-text'
              }`}
            >
              {poi.description}
            </Text>
          </View>
        )}

        {/* Actions */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={handleDirections}
            className="flex-1 bg-primary-500 py-4 px-6 rounded-2xl flex-row items-center justify-center"
            style={{
              shadowColor: '#0A66C2',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Ionicons name="navigate" size={20} color="white" style={{ marginRight: 8 }} />
            <Text className="text-white font-semibold text-base">Itinéraire</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            className="bg-gray-200 py-4 px-6 rounded-2xl flex-row items-center justify-center"
          >
            <Ionicons name="share" size={20} color="#6B7280" style={{ marginRight: 8 }} />
            <Text className="text-gray-700 font-semibold text-base">Partager</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

export default POIDetailsSheet;
