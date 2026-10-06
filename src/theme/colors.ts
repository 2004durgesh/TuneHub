import { Color } from 'expo-router';
import { Platform } from 'react-native';
import type { ColorValue } from 'react-native';

// Material 3 dark scheme (TonalSpot, seed #485A8C). Material You is Android-only —
// `Color.android.dynamic.*` is null on iOS despite its non-null type — so iOS/web use
// these static values and Android uses the live wallpaper-derived roles.
const md3 = {
  background: '#121318',
  surface: '#121318',
  surfaceContainer: '#1E1F25',
  surfaceContainerHigh: '#292A2F',
  outlineVariant: '#45464F',
  onSurface: '#E3E2E9',
  onSurfaceVariant: '#C5C6D0',
  outline: '#8F909A',
  primary: '#B2C5FF',
  onPrimary: '#182E60',
  secondary: '#C0C6DD',
  error: '#FFB4AB',
} as const;

function material(role: keyof typeof md3): ColorValue {
  return Platform.OS === 'android' ? Color.android.dynamic[role] : md3[role];
}

export const colors = {
  background: material('background'),
  surface: material('surface'),
  surfaceElevated: material('surfaceContainer'),
  surfaceHigh: material('surfaceContainerHigh'),
  border: material('outlineVariant'),

  text: material('onSurface'),
  textSecondary: material('onSurfaceVariant'),
  textTertiary: material('outline'),

  accent: material('primary'),
  onAccent: material('onPrimary'),

  like: material('error'),
  success: material('primary'),
  error: material('error'),

  overlay: 'rgba(0,0,0,0.6)',
  scrim: 'rgba(0,0,0,0.4)',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof colors;

// Raw hex for the Reanimated atmosphere tint, which interpolates strings and
// can't take opaque native color refs.
export const hexColors = {
  background: md3.background,
  surface: md3.surface,
  surfaceElevated: md3.surfaceContainer,
  surfaceHigh: md3.surfaceContainerHigh,
} as const;
