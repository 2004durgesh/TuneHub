import { create } from 'zustand';
import { storage } from '@/services/storage/mmkv';

// Remote music data lives in TanStack Query (src/hooks/queries.ts); this store only keeps the
// search history.

const HISTORY_KEY = 'search_history';
const HISTORY_CAP = 20;

type MusicStore = {
  searchHistory: string[];
  addSearchHistory: (q: string) => void;
  clearSearchHistory: () => void;
};

function hydrateHistory(): string[] {
  const raw = storage.getString(HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function persistHistory(history: string[]): void {
  storage.set(HISTORY_KEY, JSON.stringify(history));
}

export const useMusicStore = create<MusicStore>((set, get) => ({
  searchHistory: hydrateHistory(),

  addSearchHistory: (q) => {
    const query = q.trim();
    if (!query) return;
    const deduped = [query, ...get().searchHistory.filter((h) => h !== query)];
    const capped = deduped.slice(0, HISTORY_CAP);
    persistHistory(capped);
    set({ searchHistory: capped });
  },
  clearSearchHistory: () => {
    persistHistory([]);
    set({ searchHistory: [] });
  },
}));
