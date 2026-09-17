import { create } from 'zustand';
import { storage } from '@/services/storage/mmkv';
import type { ArtistSummary, DiscoveryItem, SearchResults } from '@/types';

// NOTE: the store never calls the music service directly. Screens/hooks call
// musicService then feed the store via these setters, e.g.
//   const data = await musicService.getHome(); setHome(data);

const HISTORY_KEY = 'search_history';
const HISTORY_CAP = 20;

type HomeData = {
  charts: DiscoveryItem[];
  newReleases: DiscoveryItem[];
  featuredPlaylists: DiscoveryItem[];
  topArtists: ArtistSummary[];
};

type MusicState = {
  charts: DiscoveryItem[];
  newReleases: DiscoveryItem[];
  featuredPlaylists: DiscoveryItem[];
  topArtists: ArtistSummary[];
  homeLoading: boolean;
  homeError: string | null;
  searchQuery: string;
  searchResults: SearchResults | null;
  searchLoading: boolean;
  searchHistory: string[];
};

type MusicStore = MusicState & {
  setHome: (data: HomeData) => void;
  setHomeLoading: (loading: boolean) => void;
  setHomeError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchResults | null) => void;
  setSearchLoading: (loading: boolean) => void;
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
  charts: [],
  newReleases: [],
  featuredPlaylists: [],
  topArtists: [],
  homeLoading: false,
  homeError: null,
  searchQuery: '',
  searchResults: null,
  searchLoading: false,
  searchHistory: hydrateHistory(),

  setHome: (data) =>
    set({
      charts: data.charts,
      newReleases: data.newReleases,
      featuredPlaylists: data.featuredPlaylists,
      topArtists: data.topArtists,
    }),
  setHomeLoading: (homeLoading) => set({ homeLoading }),
  setHomeError: (homeError) => set({ homeError }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setSearchLoading: (searchLoading) => set({ searchLoading }),

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
