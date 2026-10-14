/**
 * Premium design tokens — refined palette with depth and sophistication.
 */

export const COLORS = {
  // ── Gradient pairs ──
  gradientStart: '#1E1B4B',    // Deep indigo
  gradientMid: '#312E81',      // Rich indigo
  gradientEnd: '#4338CA',      // Vibrant indigo

  // ── Backgrounds ──
  background: '#F4F5FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceSubtle: '#F8F9FC',
  surfaceMuted: '#F1F2F8',

  // ── Text ──
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  textWhite: '#FFFFFF',
  textWhiteMuted: 'rgba(255,255,255,0.65)',

  // ── Primary ──
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  primaryLight: '#EEF2FF',
  primaryMuted: 'rgba(79, 70, 229, 0.08)',

  // ── Performance: Good ──
  good: '#059669',
  goodLight: '#ECFDF5',
  goodSurface: '#D1FAE5',
  goodBorder: '#A7F3D0',

  // ── Performance: Needs Improvement ──
  warning: '#D97706',
  warningLight: '#FFFBEB',
  warningSurface: '#FEF3C7',
  warningBorder: '#FDE68A',

  // ── Assessment types ──
  recorded: '#7C3AED',
  recordedLight: '#F5F3FF',
  recordedSurface: '#EDE9FE',

  textType: '#0891B2',
  textTypeLight: '#ECFEFF',
  textTypeSurface: '#CFFAFE',

  // ── Status ──
  completedBg: '#ECFDF5',
  completedText: '#059669',
  pendingBg: '#F1F5F9',
  pendingText: '#64748B',

  // ── Semantic ──
  danger: '#EF4444',
  dangerLight: '#FEF2F2',

  // ── Chrome ──
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  divider: '#F1F5F9',
  shadow: '#0F172A',
  overlay: 'rgba(15, 23, 42, 0.5)',

  // ── Bottom bar ──
  tabActive: '#4F46E5',
  tabInactive: '#94A3B8',

  // ── Progress circles ──
  circleCompleted: '#059669',
  circleActive: '#4F46E5',
  circlePending: '#E2E8F0',
  circlePendingText: '#94A3B8',
};

export const FONTS = {
  sizes: {
    xxs: 10,
    xs: 11,
    sm: 12,
    md: 13,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 34,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
  },
  letterSpacing: {
    tight: -0.4,
    normal: 0,
    wide: 0.3,
    wider: 0.6,
    widest: 1.2,
  },
};

export const SPACING = {
  '2xs': 2,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  '5xl': 40,
  '6xl': 48,
};

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
};

export const SCORE_GOOD_THRESHOLD = 75;
