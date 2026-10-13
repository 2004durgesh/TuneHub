import { create } from 'zustand';
import { storage } from '@/services/storage/mmkv';
import type { Download, DownloadCollection, DownloadStatus, Song } from '@/types';

const DOWNLOADS_KEY = 'downloads';
const COLLECTIONS_KEY = 'download_collections';

type Downloads = Record<string, Download>;
type Collections = Record<string, DownloadCollection>;

type DownloadStore = {
  downloads: Downloads;
  collections: Collections;
  add: (song: Song, single: boolean) => void;
  setDownloading: (id: string) => void;
  setProgress: (id: string, progress: number) => void;
  setCompleted: (id: string, bytes: number) => void;
  setFailed: (id: string, error: string) => void;
  remove: (id: string) => void;
  saveCollection: (collection: DownloadCollection) => void;
  removeCollection: (id: string) => void;
  clear: () => void;
};

function read<T>(key: string): Record<string, T> {
  const raw = storage.getString(key);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, T>;
  } catch {
    return {};
  }
}

function hydrateDownloads(): Downloads {
  const downloads = read<Download>(DOWNLOADS_KEY);
  // Records from before collections existed were all single-song downloads.
  for (const id of Object.keys(downloads)) {
    downloads[id] = { ...downloads[id], single: downloads[id].single ?? true };
  }
  return downloads;
}

export const useDownloadStore = create<DownloadStore>((set, get) => {
  const saveDownloads = (downloads: Downloads) => {
    set({ downloads });
    storage.set(DOWNLOADS_KEY, JSON.stringify(downloads));
  };
  const saveCollections = (collections: Collections) => {
    set({ collections });
    storage.set(COLLECTIONS_KEY, JSON.stringify(collections));
  };
  const update = (id: string, patch: Partial<Download>, persist = true) => {
    const current = get().downloads[id];
    if (!current) return;
    const downloads = { ...get().downloads, [id]: { ...current, ...patch } };
    if (persist) saveDownloads(downloads);
    else set({ downloads });
  };
  const setStatus = (id: string, status: DownloadStatus, patch: Partial<Download> = {}) =>
    update(id, { status, ...patch });

  return {
    downloads: hydrateDownloads(),
    collections: read<DownloadCollection>(COLLECTIONS_KEY),

    add: (song, single) => {
      const previous = get().downloads[song.id];
      saveDownloads({
        ...get().downloads,
        [song.id]: {
          song,
          status: 'queued',
          progress: 0,
          bytes: 0,
          error: null,
          addedAt: Date.now(),
          single: single || (previous?.single ?? false),
        },
      });
    },
    setDownloading: (id) => setStatus(id, 'downloading', { progress: 0, error: null }),
    setProgress: (id, progress) => {
      const current = get().downloads[id];
      if (!current || Math.floor(progress * 100) === Math.floor(current.progress * 100)) return;
      update(id, { progress }, false);
    },
    setCompleted: (id, bytes) => setStatus(id, 'completed', { progress: 1, bytes }),
    setFailed: (id, error) => setStatus(id, 'failed', { error }),
    remove: (id) => {
      const { [id]: _removed, ...downloads } = get().downloads;
      saveDownloads(downloads);
      const collections: Collections = {};
      for (const collection of Object.values(get().collections)) {
        const songIds = collection.songIds.filter((songId) => songId !== id);
        if (songIds.length > 0) collections[collection.id] = { ...collection, songIds };
      }
      saveCollections(collections);
    },
    saveCollection: (collection) =>
      saveCollections({ ...get().collections, [collection.id]: collection }),
    removeCollection: (id) => {
      const { [id]: _removed, ...collections } = get().collections;
      saveCollections(collections);
    },
    clear: () => {
      saveDownloads({});
      saveCollections({});
    },
  };
});
