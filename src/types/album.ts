import type { Song } from './song';

export type Album = {
  id: string;
  title: string;
  artistName: string;
  artistId: string | null;
  artworkUrl: string;
  year: number | null;
  songCount: number | null;
  language: string;
  songs: Song[];
};

export type AlbumSummary = {
  id: string;
  title: string;
  artistName: string;
  artworkUrl: string;
  year: number | null;
};
