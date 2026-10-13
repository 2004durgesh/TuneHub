import { useEffect, useState } from 'react';
import {
  Easing,
  type SharedValue,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  Canvas,
  Fill,
  Group,
  ImageShader,
  rect,
  rrect,
  Shader,
  Skia,
  type SkImage,
} from 'react-native-skia';

import { useArtworkImage } from '@/hooks/useArtworkImage';
import { hexColors } from '@/theme';

const DISSOLVE_MS = 900;

function compileShader(sksl: string) {
  const effect = Skia.RuntimeEffect.Make(sksl);
  if (!effect) throw new Error('ArtworkTransition: dissolve shader failed to compile');
  return effect;
}

// Noise dissolve between slotA (progress 0) and slotB (progress 1), glowing along the edge.
const DISSOLVE = compileShader(`
uniform shader slotA;
uniform shader slotB;
uniform float progress;
uniform float2 size;

const float EDGE = 0.08;

float hash(float2 p) {
  return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453);
}

float noise(float2 p) {
  float2 i = floor(p);
  float2 f = fract(p);
  float2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + float2(1.0, 0.0)), u.x),
             mix(hash(i + float2(0.0, 1.0)), hash(i + float2(1.0, 1.0)), u.x), u.y);
}

half4 main(float2 xy) {
  float2 uv = xy / size;
  float n = 0.65 * noise(uv * 5.0) + 0.35 * noise(uv * 13.0);
  float p = progress * (1.0 + 2.0 * EDGE) - EDGE;
  half t = half(smoothstep(n - EDGE, n + EDGE, p));
  half4 color = mix(slotA.eval(xy), slotB.eval(xy), t);
  half glow = 1.0 - abs(t * 2.0 - 1.0);
  color.rgb += glow * 0.35;
  return color;
}
`);

type Props = {
  uri: string;
  size: number;
  /** Corner radius in canvas units — animated, since NowPlaying scales the canvas while morphing. */
  radius: SharedValue<number>;
  animate: boolean;
};

type Slots = { a: SkImage | null; b: SkImage | null; showing: 'a' | 'b' };

/**
 * Player artwork that dissolves into the next track's cover via a Skia runtime shader. The
 * transition starts once the new image has decoded, so it never dissolves into a blank frame.
 */
export function ArtworkTransition({ uri, size, radius, animate }: Props) {
  const image = useArtworkImage(uri);
  // Two ping-ponged slots (progress 0 = a, 1 = b). A new cover goes into the hidden slot and
  // progress animates toward it, so the first frame after the swap still shows the old cover.
  // Swapping images and resetting progress instead flashed the new cover for a frame, because
  // the image prop and the progress shared value don't update in the same frame.
  const [slots, setSlots] = useState<Slots>({ a: null, b: null, showing: 'b' });
  const progress = useSharedValue(1);

  const shown = slots.showing === 'a' ? slots.a : slots.b;
  if (image && image !== shown) {
    setSlots(
      slots.showing === 'a'
        ? { a: slots.a, b: image, showing: 'b' }
        : { a: image, b: slots.b, showing: 'a' },
    );
  }

  useEffect(() => {
    const target = slots.showing === 'a' ? 0 : 1;
    const hidden = slots.showing === 'a' ? slots.b : slots.a;
    if (!hidden || !animate) {
      progress.value = target;
      return;
    }
    progress.value = withTiming(target, {
      duration: DISSOLVE_MS,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [slots, animate, progress]);

  const uniforms = useDerivedValue(() => ({ progress: progress.value, size: [size, size] }));
  const bounds = rect(0, 0, size, size);
  const clip = useDerivedValue(() => rrect(rect(0, 0, size, size), radius.value, radius.value));

  return (
    <Canvas style={{ width: size, height: size }}>
      <Group clip={clip}>
        {slots.a || slots.b ? (
          <Fill>
            <Shader source={DISSOLVE} uniforms={uniforms}>
              <ImageShader image={slots.a ?? slots.b} fit="cover" rect={bounds} />
              <ImageShader image={slots.b ?? slots.a} fit="cover" rect={bounds} />
            </Shader>
          </Fill>
        ) : (
          <Fill color={hexColors.surfaceElevated} />
        )}
      </Group>
    </Canvas>
  );
}
