import { Color } from 'expo-router';
import { Platform } from 'react-native';
import type { ColorValue } from 'react-native';

function pick(ios: ColorValue, android: ColorValue, fallback: string): ColorValue {
  return Platform.select({ ios, android, default: fallback }) ?? fallback;
}

const d = Color.android.dynamic;
const i = Color.ios;

export const colors = {
  background: pick(i.systemBackground, d.background, '#0D0D0F'),
  surface: pick(i.secondarySystemBackground, d.surface, '#16161A'),
  surfaceElevated: pick(i.tertiarySystemBackground, d.surfaceContainer, '#1E1E24'),
  surfaceHigh: pick(i.systemGray5, d.surfaceContainerHigh, '#26262E'),
  border: pick(i.separator, d.outlineVariant, '#2A2A32'),

  text: pick(i.label, d.onSurface, '#FFFFFF'),
  textSecondary: pick(i.secondaryLabel, d.onSurfaceVariant, '#A0A0AB'),
  textTertiary: pick(i.tertiaryLabel, d.outline, '#6B6B76'),

  accent: pick(i.systemPurple, d.primary, '#8B5CF6'),
  accentBlue: pick(i.systemBlue, d.primary, '#3B82F6'),
  accentPink: pick(i.systemPink, d.secondary, '#EC4899'),

  like: pick(i.systemRed, d.error, '#EF4444'),
  success: pick(i.systemGreen, d.primary, '#22C55E'),
  error: pick(i.systemRed, d.error, '#F87171'),

  overlay: 'rgba(0,0,0,0.6)',
  scrim: 'rgba(0,0,0,0.4)',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof colors;

// Raw hex fallbacks for the two Reanimated color animations (the atmosphere
// tint), which interpolate string colors and can't take opaque native refs.
export const hexColors = {
  background: '#0D0D0F',
  surface: '#16161A',
} as const;
