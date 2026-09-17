import type { TrackItem } from 'react-native-nitro-player';
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
    url: song.streamUrl,
    artwork: song.artworkUrl,
    extraPayload: {
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

/**
 * Best-effort reconstruction of a Song from a TrackItem. TrackItem lacks
 * several domain fields; those are filled with sensible defaults.
 */
export function trackToSong(track: TrackItem): Song {
  const artwork = track.artwork ?? '';
  return {
    id: track.id,
    title: track.title,
    artistName: track.artist,
    artistId: '',
    albumName: track.album || null,
    albumId: null,
    artworkUrl: artwork,
    artworkSmall: artwork,
    duration: track.duration,
    streamUrl: track.url,
    hasLyrics: false,
    lyricsId: null,
    language: '',
    year: null,
  };
}
