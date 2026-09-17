export const radii = {
  none: 0,
  sm: 8,
  artwork: 12,
  card: 16,
  sheet: 24,
  pill: 999,
} as const;

export type RadiusKey = keyof typeof radii;
