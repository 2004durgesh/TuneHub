export const colors = {
  background: '#0D0D0F',
  surface: '#16161A',
  surfaceElevated: '#1E1E24',
  surfaceHigh: '#26262E',
  border: '#2A2A32',

  text: '#FFFFFF',
  textSecondary: '#A0A0AB',
  textTertiary: '#6B6B76',

  accent: '#8B5CF6',
  accentBlue: '#3B82F6',
  accentPink: '#EC4899',

  like: '#EF4444',
  success: '#22C55E',
  error: '#F87171',

  overlay: 'rgba(0,0,0,0.6)',
  scrim: 'rgba(0,0,0,0.4)',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof colors;
