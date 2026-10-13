import { useEffect, useState } from 'react';
import { AlphaType, ColorType, rect, Skia, type SkImage } from 'react-native-skia';
import type { ArtworkColors } from '@/types';

const SAMPLE = 24;
const CACHE_LIMIT = 50;
const MIN_DISTINCT = 60;

const cache = new Map<string, ArtworkColors>();

type Swatch = { count: number; r: number; g: number; b: number; s: number; l: number };

function toHex({ r, g, b }: Swatch): string {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
}

function distance(a: Swatch, b: Swatch): number {
  return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
}

function maxBy<T>(items: T[], score: (item: T) => number): T | undefined {
  let best: T | undefined;
  let bestScore = -Infinity;
  for (const item of items) {
    const s = score(item);
    if (s > bestScore) {
      best = item;
      bestScore = s;
    }
  }
  return best;
}

// Downscale on a CPU surface so pixels can be read synchronously, as RGBA on every platform.
function samplePixels(image: SkImage): Uint8Array | null {
  const surface = Skia.Surface.Make(SAMPLE, SAMPLE);
  if (!surface) return null;
  surface
    .getCanvas()
    .drawImageRect(
      image,
      rect(0, 0, image.width(), image.height()),
      rect(0, 0, SAMPLE, SAMPLE),
      Skia.Paint(),
    );
  surface.flush();
  const pixels = surface.makeImageSnapshot().readPixels(0, 0, {
    width: SAMPLE,
    height: SAMPLE,
    colorType: ColorType.RGBA_8888,
    alphaType: AlphaType.Unpremul,
  });
  return pixels instanceof Uint8Array ? pixels : null;
}

// Buckets pixels at 3 bits per channel, then picks the palette roles from the averaged swatches.
function buildPalette(pixels: Uint8Array): ArtworkColors | null {
  const buckets = new Map<number, { count: number; r: number; g: number; b: number }>();
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < 128) continue;
    const [r, g, b] = [pixels[i], pixels[i + 1], pixels[i + 2]];
    const key = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5);
    const bucket = buckets.get(key) ?? { count: 0, r: 0, g: 0, b: 0 };
    bucket.count += 1;
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    buckets.set(key, bucket);
  }

  const swatches: Swatch[] = [...buckets.values()]
    .map(({ count, r, g, b }) => {
      const [rr, gg, bb] = [r / count, g / count, b / count];
      const max = Math.max(rr, gg, bb) / 255;
      const min = Math.min(rr, gg, bb) / 255;
      const l = (max + min) / 2;
      const s = max === min ? 0 : (max - min) / (1 - Math.abs(2 * l - 1));
      return { count, r: rr, g: gg, b: bb, s, l };
    })
    .sort((a, b) => b.count - a.count);

  const dominant = swatches[0];
  if (!dominant) return null;
  const vibrant =
    maxBy(
      swatches.filter((c) => c.l > 0.25 && c.l < 0.8),
      (c) => c.s * Math.sqrt(c.count),
    ) ?? dominant;
  const secondary =
    swatches.find(
      (c) => distance(c, dominant) > MIN_DISTINCT && distance(c, vibrant) > MIN_DISTINCT,
    ) ?? vibrant;
  const dark =
    maxBy(
      swatches.filter((c) => c.l < 0.35),
      (c) => c.count,
    ) ?? dominant;

  return {
    primary: toHex(vibrant),
    background: toHex(dominant),
    secondary: toHex(secondary),
    detail: toHex(dark),
  };
}

async function extractPalette(url: string): Promise<ArtworkColors | null> {
  const cached = cache.get(url);
  if (cached) return cached;
  const image = Skia.Image.MakeImageFromEncoded(await Skia.Data.fromURI(url));
  const pixels = image ? samplePixels(image) : null;
  const palette = pixels ? buildPalette(pixels) : null;
  if (palette) {
    if (cache.size >= CACHE_LIMIT) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }
    cache.set(url, palette);
  }
  return palette;
}

/**
 * Extract a four-color palette from artwork with Skia for the dynamic atmosphere. Returns null
 * while the first palette loads or on failure; on track change the previous palette stays until
 * the next one is ready, so the backdrop crossfades instead of flashing.
 */
export function useArtworkColors(artworkUrl: string | undefined): ArtworkColors | null {
  const [result, setResult] = useState<ArtworkColors | null>(null);
  const cached = artworkUrl ? cache.get(artworkUrl) : undefined;

  useEffect(() => {
    if (!artworkUrl || cache.has(artworkUrl)) return;
    let active = true;
    extractPalette(artworkUrl)
      .then((palette) => {
        if (active) setResult(palette);
      })
      .catch(() => {
        if (active) setResult(null);
      });
    return () => {
      active = false;
    };
  }, [artworkUrl]);

  return artworkUrl ? (cached ?? result) : null;
}
