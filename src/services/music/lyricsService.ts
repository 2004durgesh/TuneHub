import { SaavnError } from 'jiosaavn-sdk';
import { songApi } from './client';

export type Lyrics = { text: string; copyright: string | null };

const CACHE_LIMIT = 50;
const cache = new Map<string, Lyrics | null>();

function remember(lyricsId: string, lyrics: Lyrics | null) {
  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(lyricsId, lyrics);
}

/** Lyrics already fetched this session: null when the song has none, undefined when not fetched. */
export function getCachedLyrics(lyricsId: string): Lyrics | null | undefined {
  return cache.get(lyricsId);
}

/**
 * Full lyrics for a song as plain text with line breaks, or null when the song has no lyrics /
 * the request fails. Takes `Song.lyricsId`, or the song id — the endpoint accepts either.
 */
export async function getLyrics(lyricsId: string): Promise<Lyrics | null> {
  const cached = cache.get(lyricsId);
  if (cached !== undefined) return cached;
  try {
    const { lyrics, copyright } = await songApi.getLyrics(lyricsId);
    const result = lyrics ? { text: lyrics, copyright } : null;
    remember(lyricsId, result);
    return result;
  } catch (error) {
    // "No lyrics" is final; network failures aren't cached, so they're retried next time.
    if (error instanceof SaavnError && error.statusCode === 404) remember(lyricsId, null);
    return null;
  }
}
