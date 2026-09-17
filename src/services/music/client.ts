import {
  SongService,
  AlbumService,
  ArtistService,
  PlaylistService,
  SearchService,
  DiscoverService,
} from 'jiosaavn-sdk';

// Singletons for the six JioSaavn SDK service classes.
// This file (and this directory) is the ONLY place allowed to import from
// 'jiosaavn-sdk'. Everything else in the app talks to the domain services.
export const songApi = new SongService();
export const albumApi = new AlbumService();
export const artistApi = new ArtistService();
export const playlistApi = new PlaylistService();
export const searchApi = new SearchService();
export const discoverApi = new DiscoverService();
