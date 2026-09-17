import { useCallback, useSyncExternalStore } from 'react';
import type { Song } from '@/types';
import {
  getHistory,
  addToHistory as addToHistoryStorage,
  clearHistory as clearHistoryStorage,
} from '@/services/storage/history';

const listeners = new Set<() => void>();
let snapshot: Song[] = getHistory();

function emit() {
  snapshot = getHistory();
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// Call from the playback layer whenever a song starts.
export function recordPlay(song: Song) {
  addToHistoryStorage(song);
  emit();
}

export function useHistory() {
  const history = useSyncExternalStore(subscribe, () => snapshot);

  const clear = useCallback(() => {
    clearHistoryStorage();
    emit();
  }, []);

  return { history, clearHistory: clear };
}
