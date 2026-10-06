import { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import {
  cancelAnimation,
  Easing,
  type SharedValue,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Canvas, Circle, Fill, Group, Skia, TileMode } from 'react-native-skia';

import { hexColors, timings } from '@/theme';
import type { ArtworkColors } from '@/types';

const TAU = Math.PI * 2;
const DRIFT_MS = 24000;
const BLUR_SIGMA = 70;
// Dims the blobs over the dark base so player text stays legible on bright artwork.
const BLOB_OPACITY = 0.55;

const FALLBACK: ArtworkColors = {
  primary: hexColors.surfaceHigh,
  background: hexColors.background,
  secondary: hexColors.surfaceElevated,
  detail: hexColors.surfaceHigh,
};

type BlobProps = {
  clock: SharedValue<number>;
  color: SharedValue<string>;
  x: number;
  y: number;
  dx: number;
  dy: number;
  r: number;
  phase: number;
};

// Orbits (x, y). Integer multiples of TAU keep the loop seamless when the clock wraps 1 → 0.
function Blob({ clock, color, x, y, dx, dy, r, phase }: BlobProps) {
  const cx = useDerivedValue(() => x + dx * Math.cos(clock.value * TAU + phase));
  const cy = useDerivedValue(() => y + dy * Math.sin(clock.value * TAU * 2 + phase));
  return <Circle cx={cx} cy={cy} r={r} color={color} />;
}

type Props = {
  palette: ArtworkColors | null;
  animate: boolean;
};

/**
 * Living mesh-gradient backdrop for the player: blurred blobs in the artwork's palette drift
 * slowly and crossfade to the next track's colors.
 */
export function PlayerBackdrop({ palette, animate }: Props) {
  const { width, height } = useWindowDimensions();
  const clock = useSharedValue(0);
  const c1 = useSharedValue<string>(FALLBACK.primary);
  const c2 = useSharedValue<string>(FALLBACK.secondary);
  const c3 = useSharedValue<string>(FALLBACK.detail);
  const c4 = useSharedValue<string>(FALLBACK.background);

  const blurLayer = useMemo(() => {
    const paint = Skia.Paint();
    paint.setImageFilter(Skia.ImageFilter.MakeBlur(BLUR_SIGMA, BLUR_SIGMA, TileMode.Clamp, null));
    return paint;
  }, []);

  useEffect(() => {
    const p = palette ?? FALLBACK;
    if (animate) {
      c1.value = withTiming(p.primary, timings.atmosphere);
      c2.value = withTiming(p.secondary, timings.atmosphere);
      c3.value = withTiming(p.detail, timings.atmosphere);
      c4.value = withTiming(p.background, timings.atmosphere);
    } else {
      c1.value = p.primary;
      c2.value = p.secondary;
      c3.value = p.detail;
      c4.value = p.background;
    }
  }, [palette, animate, c1, c2, c3, c4]);

  useEffect(() => {
    if (!animate) return;
    clock.value = 0;
    clock.value = withRepeat(withTiming(1, { duration: DRIFT_MS, easing: Easing.linear }), -1);
    return () => cancelAnimation(clock);
  }, [animate, clock]);

  const r = width * 0.6;

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      <Fill color={hexColors.background} />
      <Group layer={blurLayer} opacity={BLOB_OPACITY}>
        <Blob
          clock={clock}
          color={c4}
          x={width * 0.5}
          y={height * 0.5}
          dx={width * 0.1}
          dy={height * 0.05}
          r={r * 1.3}
          phase={0}
        />
        <Blob
          clock={clock}
          color={c1}
          x={width * 0.2}
          y={height * 0.22}
          dx={width * 0.18}
          dy={height * 0.08}
          r={r}
          phase={0}
        />
        <Blob
          clock={clock}
          color={c2}
          x={width * 0.85}
          y={height * 0.45}
          dx={width * 0.15}
          dy={height * 0.1}
          r={r * 0.9}
          phase={2.1}
        />
        <Blob
          clock={clock}
          color={c3}
          x={width * 0.3}
          y={height * 0.8}
          dx={width * 0.2}
          dy={height * 0.07}
          r={r}
          phase={4.2}
        />
      </Group>
    </Canvas>
  );
}
