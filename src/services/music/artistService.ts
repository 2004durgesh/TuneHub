import type { Artist, Song, AudioQuality } from '@/types';
import { artistApi } from './client';
import { toArtist, toSong } from './adapter';

export async function getArtist(id: string, quality: AudioQuality = '320kbps'): Promise<Artist> {
  const raw = await artistApi.getArtistById({
    artistId: id,
    page: 1,
    songCount: 10,
    albumCount: 10,
    sortBy: 'popularity',
    sortOrder: 'desc',
  });
  return toArtist(raw, quality);
}

/**
 * One page of an artist's songs, most popular first. Pages start at 0 and vary in size (10, 7, 5…),
 * and the reported total overshoots, so keep loading until a page comes back empty.
 */
export async function getArtistSongs(
  id: string,
  page = 0,
  quality: AudioQuality = '320kbps',
): Promise<Song[]> {
  const res = await artistApi.getArtistSongs({
    artistId: id,
    page,
    sortBy: 'popularity',
    sortOrder: 'desc',
  });
  return (res.songs ?? []).map((s) => toSong(s, quality));
}
