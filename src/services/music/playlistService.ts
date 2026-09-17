import type { RemotePlaylist, AudioQuality } from '@/types';
import { playlistApi } from './client';
import { toRemotePlaylist } from './adapter';

export async function getPlaylist(
  id: string,
  page = 1,
  limit = 50,
  quality: AudioQuality = '320kbps',
): Promise<RemotePlaylist> {
  const raw = await playlistApi.getPlaylistById({ id, limit, page });
  return toRemotePlaylist(raw, quality);
}
