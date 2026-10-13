import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import {
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Canvas, Fill, Shader, Skia } from 'react-native-skia';

import { hexColors, timings } from '@/theme';
import type { ArtworkColors } from '@/types';

const DRIFT_MS = 24000;
const DRIFT_FPS = 24;
const DRIFT_FRAME_MS = 1000 / DRIFT_FPS;
// Drawn at 1/SCALE resolution and scaled up: the blobs are soft anyway, so it looks the same for
// SCALE² fewer pixels.
const SCALE = 4;
const BLUR_SIGMA = 70 / SCALE;
// Dims the blobs over the dark base so player text stays legible on bright artwork.
const BLOB_OPACITY = 0.55;

const FALLBACK: ArtworkColors = {
  primary: hexColors.surfaceHigh,
  background: hexColors.background,
  secondary: hexColors.surfaceElevated,
  detail: hexColors.surfaceHigh,
};

function compileShader(sksl: string) {
  const effect = Skia.RuntimeEffect.Make(sksl);
  if (!effect) throw new Error('PlayerBackdrop: blob shader failed to compile');
  return effect;
}

// Four drifting soft blobs in one pass (a blurred disc is a smoothstep falloff). Orbits use
// integer multiples of TAU so the loop is seamless when the clock wraps 1 → 0.
const BLOBS = compileShader(`
uniform float2 res;
uniform float clock;
uniform float sigma;
uniform float opacity;
uniform half4 base;
uniform half4 c1;
uniform half4 c2;
uniform half4 c3;
uniform half4 c4;

const float TAU = 6.2831853;

float blob(float2 xy, float2 center, float radius) {
  return 1.0 - smoothstep(radius - 2.0 * sigma, radius + 2.0 * sigma, distance(xy, center));
}

float2 orbit(float2 anchor, float2 swing, float phase) {
  return res * (anchor + swing * float2(cos(clock * TAU + phase), sin(clock * TAU * 2.0 + phase)));
}

half4 over(half4 under, half4 color, float a) {
  return half4(color.rgb * half(a) + under.rgb * half(1.0 - a), half(a) + under.a * half(1.0 - a));
}

half4 main(float2 xy) {
  float r = res.x * 0.6;
  half4 layer = half4(0.0);
  layer = over(layer, c4, blob(xy, orbit(float2(0.5, 0.5), float2(0.1, 0.05), 0.0), r * 1.3));
  layer = over(layer, c1, blob(xy, orbit(float2(0.2, 0.22), float2(0.18, 0.08), 0.0), r));
  layer = over(layer, c2, blob(xy, orbit(float2(0.85, 0.45), float2(0.15, 0.1), 2.1), r * 0.9));
  layer = over(layer, c3, blob(xy, orbit(float2(0.3, 0.8), float2(0.2, 0.07), 4.2), r));
  half o = half(opacity);
  return half4(base.rgb * (1.0 - o * layer.a) + layer.rgb * o, 1.0);
}
`);

type Props = {
  palette: ArtworkColors | null;
  animate: boolean;
};

/** Mesh-gradient backdrop for the player: soft blobs in the artwork's palette drift slowly and crossfade to the next track's colors. */
export function PlayerBackdrop({ palette, animate }: Props) {
  const window = useWindowDimensions();
  const width = window.width / SCALE;
  const height = window.height / SCALE;
  const clock = useSharedValue(0);
  const lastTick = useSharedValue(-DRIFT_FRAME_MS);
  const c1 = useSharedValue<string>(FALLBACK.primary);
  const c2 = useSharedValue<string>(FALLBACK.secondary);
  const c3 = useSharedValue<string>(FALLBACK.detail);
  const c4 = useSharedValue<string>(FALLBACK.background);

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

  // The drift is slow and the blobs are soft, so it only advances DRIFT_FPS times a second.
  // (A JS timer instead costs more: every step crosses from the JS thread to the UI thread.)
  const drift = useFrameCallback(({ timeSinceFirstFrame }) => {
    if (timeSinceFirstFrame - lastTick.get() < DRIFT_FRAME_MS) return;
    lastTick.set(timeSinceFirstFrame);
    clock.set((timeSinceFirstFrame % DRIFT_MS) / DRIFT_MS);
  }, animate);
  useEffect(() => {
    drift.setActive(animate);
  }, [animate, drift]);

  const uniforms = useDerivedValue(() => ({
    res: [width, height],
    clock: clock.value,
    sigma: BLUR_SIGMA,
    opacity: BLOB_OPACITY,
    base: Skia.Color(hexColors.background),
    c1: Skia.Color(c1.value),
    c2: Skia.Color(c2.value),
    c3: Skia.Color(c3.value),
    c4: Skia.Color(c4.value),
  }));

  return (
    <Canvas style={[styles.canvas, { width, height }]} pointerEvents="none">
      <Fill>
        <Shader source={BLOBS} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    transformOrigin: 'top left',
    transform: [{ scale: SCALE }],
  },
});
