// The JioSaavn SDK doesn't expose a lyrics method, so we hit the public
// lyrics endpoint directly. This still lives inside services/music so UI code
// never reaches for the network itself.
const LYRICS_ENDPOINT = 'https://www.jiosaavn.com/api.php';

type LyricsResponse = {
  lyrics?: string;
  lyrics_copyright?: string;
  snippet?: string;
};

/**
 * Fetch full lyrics for a song by its lyricsId. Returns plain text with line
 * breaks, or null when the song has no lyrics / the request fails.
 */
export async function getLyrics(lyricsId: string): Promise<string | null> {
  const url =
    `${LYRICS_ENDPOINT}?__call=lyrics.getLyrics&lyrics_id=${encodeURIComponent(lyricsId)}` +
    `&ctx=web6dot0&api_version=4&_format=json&_marker=0`;

  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as LyricsResponse;
    if (!data.lyrics) return null;
    return data.lyrics.replace(/<br\s*\/?>/gi, '\n').trim();
  } catch {
    return null;
  }
}
