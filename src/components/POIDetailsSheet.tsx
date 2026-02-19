import React, { useRef, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, Linking, Share, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { POI } from '@/types';
import { colors, radius, blur, shadows, spacing, typography } from '@/theme/tokens';

interface POIDetailsSheetProps {
  poi: POI | null;
  onClose: () => void;
}

const getIconName = (type: POI['type']): keyof typeof MaterialCommunityIcons.glyphMap => {
  switch (type) {
    case 'toilet': return 'toilet';
    case 'parking': return 'parking';
    case 'wifi': return 'wifi';
    default: return 'map-marker';
  }
};

const getGradient = (type: POI['type']): [string, string] => {
  return colors.poiGradient[type] || ['#6B7592', '#4A5568'];
};

const getColor = (type: POI['type']): string => {
  return colors.poi[type] || '#6B7592';
};

const POIDetailsSheet: React.FC<POIDetailsSheetProps> = ({ poi, onClose }) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['30%', '55%', '90%'], []);

  useEffect(() => {
    if (poi) {
      bottomSheetRef.current?.expand();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `Decouvrez ${poi.name} a ${poi.address || 'cette adresse'}`,
        url: `https://www.google.com/maps?q=${poi.location.latitude},${poi.location.longitude}`,
      });
    } catch (error) {
      console.error('Erreur partage:', error);
    }
  };

  if (!poi) return null;

  const gradient = getGradient(poi.type);
  const poiColor = getColor(poi.type);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onClose={handleClose}
      enablePanDownToClose
      backgroundComponent={({ style }) => (
        <View style={[style, styles.sheetBackground]}>
          <BlurView
            intensity={blur.heavy}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <View style={[StyleSheet.absoluteFill, styles.sheetOverlay]} />
        </View>
      )}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        <Animated.View
          entering={FadeIn.delay(50).duration(300)}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.iconContainer, shadows.glow(poiColor)]}
            >
              <MaterialCommunityIcons
                name={getIconName(poi.type)}
                size={32}
                color={colors.white}
              />
            </LinearGradient>
            <View style={styles.headerText}>
              <Text style={styles.title} numberOfLines={2}>
                {poi.name}
              </Text>
              {poi.distance != null && (
                <View style={styles.distanceBadge}>
                  <Ionicons name="navigate-outline" size={12} color={colors.primary} />
                  <Text style={styles.distanceText}>
                    {Math.round(poi.distance)}m
                  </Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            hitSlop={8}
          >
            <BlurView intensity={blur.light} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.closeButtonInner}>
              <Ionicons name="close" size={18} color={colors.text.secondary} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Details */}
        <Animated.View entering={FadeIn.delay(150).duration(300)}>
          {poi.address && (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={18} color={colors.text.tertiary} />
              <Text style={styles.detailText}>{poi.address}</Text>
            </View>
          )}

          {poi.openingHours && (
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={18} color={colors.text.tertiary} />
              <Text style={styles.detailText}>{poi.openingHours}</Text>
            </View>
          )}

          {poi.description && (
            <View style={styles.detailRow}>
              <Ionicons name="information-circle-outline" size={18} color={colors.text.tertiary} />
              <Text style={styles.detailText}>{poi.description}</Text>
            </View>
          )}
        </Animated.View>

        {/* Amenities */}
        {poi.amenities && poi.amenities.length > 0 && (
          <Animated.View
            entering={FadeIn.delay(250).duration(300)}
            style={styles.amenitiesContainer}
          >
            {poi.amenities.map((amenity, index) => (
              <View key={index} style={styles.amenityChip}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Actions */}
        <Animated.View
          entering={FadeIn.delay(350).duration(300)}
          style={styles.actions}
        >
          <TouchableOpacity
            onPress={handleDirections}
            activeOpacity={0.8}
            style={styles.primaryButtonContainer}
          >
            <LinearGradient
              colors={['#2B8DFF', '#0066DD']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.primaryButton, shadows.glow(colors.primary)]}
            >
              <Ionicons name="navigate" size={20} color={colors.white} style={{ marginRight: 8 }} />
              <Text style={styles.primaryButtonText}>Itineraire</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.8}
            style={styles.secondaryButtonOuter}
          >
            <BlurView intensity={blur.light} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.secondaryButtonInner}>
              <Ionicons name="share-outline" size={20} color={colors.text.secondary} style={{ marginRight: 8 }} />
              <Text style={styles.secondaryButtonText}>Partager</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheetBackground: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    overflow: 'hidden',
  },
  sheetOverlay: {
    backgroundColor: 'rgba(19,24,36,0.95)',
  },
  handleIndicator: {
    backgroundColor: colors.text.tertiary,
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(43,141,255,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  distanceText: {
    ...typography.small,
    color: colors.primary,
    marginLeft: 4,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    marginLeft: spacing.sm,
  },
  closeButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.glass.bg,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  detailText: {
    ...typography.body,
    color: colors.text.secondary,
    marginLeft: spacing.md,
    flex: 1,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  amenityChip: {
    backgroundColor: colors.glass.bg,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  amenityText: {
    ...typography.small,
    color: colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  primaryButtonContainer: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  primaryButton: {
    height: 56,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...typography.bodyMedium,
    color: colors.white,
    fontWeight: '600',
  },
  secondaryButtonOuter: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  secondaryButtonInner: {
    height: 56,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass.bg,
    borderWidth: 1,
    borderColor: colors.glass.border,
    borderRadius: radius.lg,
  },
  secondaryButtonText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    fontWeight: '600',
  },
});

export default POIDetailsSheet;
