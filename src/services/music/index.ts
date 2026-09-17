// Music service layer — the only part of the app that talks to jiosaavn-sdk.
// All exports return app domain models (from @/types), never raw SDK types.

export * from './discoverService';
export * from './searchService';
export * from './songService';
export * from './albumService';
export * from './artistService';
export * from './playlistService';
export * from './lyricsService';

// Adapter helpers (pure) — useful for mapping raw shapes elsewhere in this layer.
export { pickImage, pickStreamUrl, toSong } from './adapter';
