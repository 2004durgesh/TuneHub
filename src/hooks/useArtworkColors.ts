import { useEffect, useState } from 'react';
import type { ArtworkColors } from '@/types';
import { colors } from '@/theme';

// react-native-image-colors is a native module; guard the import so web/Expo Go
// don't crash. Resolved once, lazily, on first use.
type ImageColorsResult =
  | { platform: 'ios'; background: string; primary: string; secondary: string; detail: string }
  | {
      platform: 'android';
      dominant: string;
      vibrant: string;
      darkVibrant: string;
      darkMuted: string;
    }
  | { platform: 'web'; dominant: string; vibrant: string; darkVibrant: string; darkMuted: string };

type GetColors = (uri: string, config?: Record<string, unknown>) => Promise<ImageColorsResult>;

let getColors: GetColors | null = null;
let attempted = false;
function loadGetColors(): GetColors | null {
  if (attempted) return getColors;
  attempted = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    getColors = require('react-native-image-colors').getColors as GetColors;
  } catch {
    getColors = null;
  }
  return getColors;
}

function normalize(result: ImageColorsResult): ArtworkColors {
  if (result.platform === 'ios') {
    return { primary: result.primary, background: result.background };
  }
  // android + web share the vibrant/darkMuted shape
  return {
    primary: result.vibrant || result.dominant,
    background: result.darkMuted || result.darkVibrant || result.dominant,
  };
}

/**
 * Extract a primary/background color pair from artwork for the dynamic
 * atmosphere. Returns null while loading, on failure, or when the palette
 * module is unavailable (web/Expo Go) — callers fall back to the dark theme.
 */
export function useArtworkColors(artworkUrl: string | undefined): ArtworkColors | null {
  const [result, setResult] = useState<ArtworkColors | null>(null);

  useEffect(() => {
    let active = true;
    const fn = loadGetColors();
    if (!fn || !artworkUrl) {
      setResult(null);
      return;
    }
    fn(artworkUrl, { fallback: colors.background, cache: true, quality: 'low' })
      .then((r) => {
        if (active) setResult(normalize(r));
      })
      .catch(() => {
        if (active) setResult(null);
      });
    return () => {
      active = false;
    };
  }, [artworkUrl]);

  return result;
}
