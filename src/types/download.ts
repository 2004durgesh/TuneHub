import type { Song } from './song';

export type DownloadStatus = 'queued' | 'downloading' | 'completed' | 'failed';

export type Download = {
  song: Song;
  status: DownloadStatus;
  progress: number;
  bytes: number;
  error: string | null;
  addedAt: number;
  /** Downloaded on its own, not only as part of a playlist or album */
  single: boolean;
};

export type DownloadCollection = {
  id: string;
  kind: 'album' | 'playlist';
  title: string;
  artworkUrl: string;
  songIds: string[];
  addedAt: number;
};

export type DownloadCollectionInfo = Omit<DownloadCollection, 'songIds' | 'addedAt'>;
