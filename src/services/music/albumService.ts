import type { Album, AudioQuality } from '@/types';
import { albumApi } from './client';
import { toAlbum } from './adapter';

export async function getAlbum(id: string, quality: AudioQuality = '320kbps'): Promise<Album> {
  const raw = await albumApi.getAlbumById(id);
  return toAlbum(raw, quality);
}
