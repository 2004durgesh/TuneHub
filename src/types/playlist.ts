import type { Song } from './song';
import type { AlbumSummary } from './album';
import type { ArtistSummary } from './artist';

// A JioSaavn-sourced playlist (curated / featured)
export type RemotePlaylist = {
  id: string;
  title: string;
  description: string | null;
  artworkUrl: string;
  songCount: number | null;
  songs: Song[];
};

// A card shown on Home discovery rows
export type DiscoveryItem = {
  id: string;
  title: string;
  subtitle: string | null;
  artworkUrl: string;
  kind: 'playlist' | 'album' | 'chart';
};

export type SearchResults = {
  songs: Song[];
  albums: AlbumSummary[];
  artists: ArtistSummary[];
  playlists: DiscoveryItem[];
};
