import type { Song, SearchResults, AudioQuality } from '@/types';
import { searchApi } from './client';
import { pickImage, toSong, toAlbumSummary, toArtistSummary, toDiscoveryItem } from './adapter';

/**
 * searchAll returns LIGHTWEIGHT results: song results carry no `downloadUrl`,
 * no `duration`, and no structured `artists` object (just comma-joined name
 * strings). We map what we have and leave `streamUrl` empty. The full,
 * playable song (with a decrypted stream url) is fetched on-demand later via
 * songService.getSongById(id).
 */
export async function searchAll(query: string): Promise<SearchResults> {
  const res = await searchApi.searchAll(query);

  const songs: Song[] = (res.songs?.results ?? []).map((r) => ({
    id: r.id,
    title: r.title ?? '',
    artistName: r.primaryArtists || r.singers || '',
    artistId: '',
    albumName: r.album || null,
    albumId: null,
    artworkUrl: pickImage(r.image ?? [], '500x500'),
    artworkSmall: pickImage(r.image ?? [], '150x150'),
    duration: 0,
    streamUrl: '', // no downloadUrl on lightweight search results
    hasLyrics: false,
    lyricsId: null,
    language: r.language ?? '',
    year: null,
  }));

  return {
    songs,
    albums: (res.albums?.results ?? []).map(toAlbumSummary),
    artists: (res.artists?.results ?? []).map(toArtistSummary),
    playlists: (res.playlists?.results ?? []).map((p) => toDiscoveryItem(p, 'playlist')),
  };
}

/**
 * Full song search — these results DO include downloadUrl, so the resulting
 * Song objects are directly playable.
 */
export async function searchSongs(
  query: string,
  page = 1,
  limit = 20,
  quality: AudioQuality = '320kbps',
): Promise<Song[]> {
  const res = await searchApi.searchSongs({ query, page, limit });
  return (res.results ?? []).map((s) => toSong(s, quality));
}
