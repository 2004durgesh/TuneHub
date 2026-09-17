import type { Song } from './song';
import type { AlbumSummary } from './album';

export type Artist = {
  id: string;
  name: string;
  artworkUrl: string;
  followerCount: number | null;
  bio: string | null;
  topSongs: Song[];
  topAlbums: AlbumSummary[];
  singles: AlbumSummary[];
};

export type ArtistSummary = {
  id: string;
  name: string;
  artworkUrl: string;
};
