import { SaavnError } from 'jiosaavn-sdk';
import { songApi } from './client';

export type Lyrics = { text: string; copyright: string | null };

/**
 * Full lyrics for a song as plain text with line breaks, or null when the song has no lyrics.
 * Takes `Song.lyricsId`, or the song id — the endpoint accepts either. Other failures throw, so
 * the query caches "no lyrics" but retries network errors.
 */
export async function getLyrics(lyricsId: string): Promise<Lyrics | null> {
  try {
    const { lyrics, copyright } = await songApi.getLyrics(lyricsId);
    return lyrics ? { text: lyrics, copyright } : null;
  } catch (error) {
    if (error instanceof SaavnError && error.statusCode === 404) return null;
    throw error;
  }
}
