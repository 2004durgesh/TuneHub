import type { Song, AudioQuality } from '@/types';
import { songApi } from './client';
import { toSong } from './adapter';

export async function getSongById(
  id: string,
  quality: AudioQuality = '320kbps',
): Promise<Song | null> {
  const songs = await songApi.getSongByIds({ songIds: id });
  const raw = songs?.[0];
  return raw ? toSong(raw, quality) : null;
}

export async function getSuggestions(
  songId: string,
  limit = 20,
  quality: AudioQuality = '320kbps',
): Promise<Song[]> {
  const songs = await songApi.getSongSuggestions({ songId, limit });
  return (songs ?? []).map((s) => toSong(s, quality));
}
