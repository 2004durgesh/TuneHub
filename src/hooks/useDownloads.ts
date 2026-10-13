import { useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  deleteAllSongFiles,
  deleteSongFile,
  enqueueDownload,
  localSongUri,
} from '@/services/downloads';
import { getSongById } from '@/services/music';
import { useDownloadStore, useSettingsStore } from '@/store';
import type { DownloadCollectionInfo, Song } from '@/types';

async function start(song: Song) {
  const store = useDownloadStore.getState;
  let url = song.streamUrl;
  if (!url.startsWith('http')) {
    const fresh = await getSongById(song.id, useSettingsStore.getState().audioQuality).catch(
      () => null,
    );
    url = fresh?.streamUrl ?? '';
  }
  if (!url) {
    store().setFailed(song.id, 'No stream available');
    return;
  }
  enqueueDownload(song.id, url, {
    onStart: () => store().setDownloading(song.id),
    onProgress: (progress) => store().setProgress(song.id, progress),
    onComplete: (bytes) => store().setCompleted(song.id, bytes),
    onError: (message) => store().setFailed(song.id, message),
  });
}

function queue(song: Song, single: boolean): void {
  const existing = useDownloadStore.getState().downloads[song.id];
  if (existing && existing.status !== 'failed') return;
  useDownloadStore.getState().add(song, single);
  void start(song);
}

export function downloadSong(song: Song): void {
  queue(song, true);
}

export function downloadCollection(info: DownloadCollectionInfo, songs: Song[]): void {
  const { collections, saveCollection } = useDownloadStore.getState();
  saveCollection({
    ...info,
    songIds: songs.map((s) => s.id),
    addedAt: collections[info.id]?.addedAt ?? Date.now(),
  });
  songs.forEach((song) => queue(song, false));
}

export function removeDownload(songId: string): void {
  deleteSongFile(songId);
  useDownloadStore.getState().remove(songId);
}

// Keeps songs that were downloaded on their own or belong to another downloaded collection.
function releaseSongs(collectionId: string, songIds: string[]) {
  const { downloads, collections } = useDownloadStore.getState();
  const needed = new Set(
    Object.values(collections)
      .filter((c) => c.id !== collectionId)
      .flatMap((c) => c.songIds),
  );
  for (const id of songIds) {
    if (!downloads[id]?.single && !needed.has(id)) removeDownload(id);
  }
}

export function removeCollectionDownloads(collectionId: string): void {
  const collection = useDownloadStore.getState().collections[collectionId];
  if (!collection) return;
  useDownloadStore.getState().removeCollection(collectionId);
  releaseSongs(collectionId, collection.songIds);
}

export function cancelCollectionDownloads(collectionId: string): void {
  const { downloads, collections } = useDownloadStore.getState();
  const unfinished = (collections[collectionId]?.songIds ?? []).filter((id) => {
    const status = downloads[id]?.status;
    return status === 'queued' || status === 'downloading';
  });
  releaseSongs(collectionId, unfinished);
}

export function removeAllDownloads(): void {
  deleteAllSongFiles();
  useDownloadStore.getState().clear();
}

export function useDownloadsBridge() {
  useEffect(() => {
    const { downloads, remove } = useDownloadStore.getState();
    for (const download of Object.values(downloads)) {
      const id = download.song.id;
      if (download.status === 'completed') {
        if (!localSongUri(id)) remove(id);
      } else if (download.status !== 'failed') {
        void start(download.song);
      }
    }
  }, []);
}

export function useDownloads() {
  const byId = useDownloadStore((s) => s.downloads);
  const downloads = useMemo(
    () => Object.values(byId).sort((a, b) => b.addedAt - a.addedAt),
    [byId],
  );
  return { downloads, byId, downloadSong, removeDownload, removeAllDownloads };
}

export function useDownloadCollections() {
  const byId = useDownloadStore((s) => s.collections);
  return useMemo(() => Object.values(byId).sort((a, b) => b.addedAt - a.addedAt), [byId]);
}

export function useHasDownloadCollection(collectionId: string) {
  return useDownloadStore((s) => collectionId in s.collections);
}

export function useDownload(songId: string | undefined) {
  return useDownloadStore((s) => (songId ? s.downloads[songId] : undefined));
}

export function useDownloadCounts(songIds: string[]) {
  return useDownloadStore(
    useShallow((s) => {
      let completed = 0;
      let active = 0;
      for (const id of songIds) {
        const status = s.downloads[id]?.status;
        if (status === 'completed') completed++;
        else if (status === 'queued' || status === 'downloading') active++;
      }
      return { completed, active };
    }),
  );
}

export function useHasActiveDownloads() {
  return useDownloadStore((s) =>
    Object.values(s.downloads).some((d) => d.status === 'queued' || d.status === 'downloading'),
  );
}
