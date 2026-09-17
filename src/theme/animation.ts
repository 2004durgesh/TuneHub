import type { WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';

export const springs: Record<'snappy' | 'smooth' | 'gentle', WithSpringConfig> = {
  snappy: { damping: 20, stiffness: 300, mass: 1 },
  smooth: { damping: 25, stiffness: 200, mass: 1 },
  gentle: { damping: 30, stiffness: 150, mass: 1 },
};

export const timings: Record<'fast' | 'base' | 'slow' | 'atmosphere', WithTimingConfig> = {
  fast: { duration: 150 },
  base: { duration: 250 },
  slow: { duration: 400 },
  atmosphere: { duration: 600 },
};
