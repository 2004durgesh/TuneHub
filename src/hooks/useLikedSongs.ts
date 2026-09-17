import { useCallback, useSyncExternalStore } from 'react';
import type { Song } from '@/types';
import { getLikedSongs, toggleLike as toggleLikeStorage } from '@/services/storage/likedSongs';

// Lightweight external store so all consumers re-render on like changes
// without a full state library. MMKV is the source of truth.
const listeners = new Set<() => void>();
let snapshot: Song[] = getLikedSongs();

function emit() {
  snapshot = getLikedSongs();
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useLikedSongs() {
  const songs = useSyncExternalStore(subscribe, () => snapshot);

  const toggle = useCallback((song: Song) => {
    const result = toggleLikeStorage(song);
    emit();
    return result.liked;
  }, []);

  const isLiked = useCallback((id: string) => songs.some((s) => s.id === id), [songs]);

  return { likedSongs: songs, toggleLike: toggle, isLiked };
}
