import type { TrackItem } from 'react-native-nitro-player';
import { localSongUri } from '@/services/downloads';
import type { Song } from '@/types';

/**
 * Convert a domain Song into the nitro-player TrackItem shape.
 * TrackItem is a lean playback record; extra Song fields are preserved
 * on `extraPayload` so a best-effort round-trip is possible.
 */
export function songToTrack(song: Song): TrackItem {
  return {
    id: song.id,
    title: song.title,
    artist: song.artistName,
    album: song.albumName ?? '',
    duration: song.duration,
    url: localSongUri(song.id) ?? song.streamUrl,
    artwork: song.artworkUrl,
    extraPayload: {
      streamUrl: song.streamUrl,
      artistId: song.artistId,
      albumId: song.albumId,
      artworkSmall: song.artworkSmall,
      hasLyrics: song.hasLyrics,
      lyricsId: song.lyricsId,
      language: song.language,
      year: song.year,
    },
  };
}

const text = (value: unknown): string | null => (typeof value === 'string' ? value : null);

// nitro-player (≤ 1.7.0-alpha.6) saves Android playlists with the artwork variant's toString(),
// `Second(value=<url>)`, nested once per save, so tracks read back from disk carry it.
function artworkUrl(raw: string | null | undefined): string {
  let url = raw ?? '';
  while (url.startsWith('Second(value=') && url.endsWith(')')) url = url.slice(13, -1);
  return url;
}

/**
 * Reconstruct a Song from a TrackItem, reading back the fields `songToTrack` stashed on
 * `extraPayload` (artist/album ids, lyrics). Tracks without a payload get sensible defaults.
 */
export function trackToSong(track: TrackItem): Song {
  const extra = track.extraPayload ?? {};
  const artwork = artworkUrl(track.artwork);
  return {
    id: track.id,
    title: track.title,
    artistName: track.artist,
    artistId: text(extra.artistId) ?? '',
    albumName: track.album || null,
    albumId: text(extra.albumId),
    artworkUrl: artwork,
    artworkSmall: text(extra.artworkSmall) ?? artwork,
    duration: track.duration,
    streamUrl: text(extra.streamUrl) ?? track.url,
    hasLyrics: extra.hasLyrics === true,
    lyricsId: text(extra.lyricsId),
    language: text(extra.language) ?? '',
    year: text(extra.year),
  };
}
