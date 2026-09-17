import { storage } from './mmkv';
import type { Song } from '@/types';

const KEY = 'liked_songs';

export function getLikedSongs(): Song[] {
  const raw = storage.getString(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Song[];
  } catch {
    return [];
  }
}

export function isLiked(id: string): boolean {
  return getLikedSongs().some((s) => s.id === id);
}

export function likeSong(song: Song): Song[] {
  const current = getLikedSongs();
  if (current.some((s) => s.id === song.id)) return current;
  const next = [song, ...current];
  storage.set(KEY, JSON.stringify(next));
  return next;
}

export function unlikeSong(id: string): Song[] {
  const next = getLikedSongs().filter((s) => s.id !== id);
  storage.set(KEY, JSON.stringify(next));
  return next;
}

export function toggleLike(song: Song): { liked: boolean; songs: Song[] } {
  if (isLiked(song.id)) {
    return { liked: false, songs: unlikeSong(song.id) };
  }
  return { liked: true, songs: likeSong(song) };
}
