import { useEffect, useState } from 'react';
import { Skia, type SkImage } from 'react-native-skia';

const CACHE_LIMIT = 6;
const loads = new Map<string, Promise<SkImage | null>>();
const decoded = new Map<string, SkImage>();

/** Downloads and decodes a cover once; the player artwork, its palette and prefetching share it. */
export function loadArtworkImage(url: string): Promise<SkImage | null> {
  const pending = loads.get(url);
  if (pending) return pending;
  const load = Skia.Data.fromURI(url)
    .then((data) => Skia.Image.MakeImageFromEncoded(data))
    .then((image) => {
      if (image) decoded.set(url, image);
      else loads.delete(url);
      return image;
    })
    .catch(() => {
      loads.delete(url);
      return null;
    });
  loads.set(url, load);
  if (loads.size > CACHE_LIMIT) {
    const oldest = loads.keys().next().value;
    if (oldest !== undefined) {
      loads.delete(oldest);
      decoded.delete(oldest);
    }
  }
  return load;
}

/** A decoded cover, or null while it loads. Cached covers are returned on the first render. */
export function useArtworkImage(url: string): SkImage | null {
  const [loaded, setLoaded] = useState<{ url: string; image: SkImage | null } | null>(null);
  const cached = url ? decoded.get(url) : undefined;

  useEffect(() => {
    if (!url || decoded.has(url)) return;
    let active = true;
    void loadArtworkImage(url).then((image) => {
      if (active) setLoaded({ url, image });
    });
    return () => {
      active = false;
    };
  }, [url]);

  if (!url) return null;
  return cached ?? (loaded?.url === url ? loaded.image : null);
}
