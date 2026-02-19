export const colors = {
  // Background
  background: '#0A0E1A',
  surface: '#131824',
  surfaceElevated: '#1C2333',

  // POI colors
  poi: {
    toilet: '#2B8DFF',
    parking: '#FFB020',
    wifi: '#00D9A3',
  },

  // POI gradients (start, end)
  poiGradient: {
    toilet: ['#2B8DFF', '#0066DD'] as [string, string],
    parking: ['#FFB020', '#DD8800'] as [string, string],
    wifi: ['#00D9A3', '#00A87A'] as [string, string],
  },

  // Primary
  primary: '#2B8DFF',
  primaryGlow: 'rgba(43, 141, 255, 0.35)',

  // Glass
  glass: {
    bg: 'rgba(255,255,255,0.08)',
    border: 'rgba(255,255,255,0.15)',
    bgElevated: 'rgba(255,255,255,0.12)',
  },

  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#A6B0CF',
    tertiary: '#6B7592',
  },

  // Status
  success: '#00D9A3',
  error: '#FF4D6A',
  info: '#2B8DFF',
  warning: '#FFB020',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(10,14,26,0.9)',
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
};

export const blur = {
  light: 10,
  medium: 20,
  heavy: 40,
  max: 60,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  }),
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodyMedium: { fontSize: 16, fontWeight: '500' as const },
  caption: { fontSize: 14, fontWeight: '400' as const },
  captionMedium: { fontSize: 14, fontWeight: '500' as const },
  small: { fontSize: 12, fontWeight: '500' as const },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const animation = {
  spring: { damping: 15, stiffness: 150 },
  springBouncy: { damping: 12, stiffness: 180 },
  springGentle: { damping: 20, stiffness: 120 },
};
