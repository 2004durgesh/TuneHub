export type PlaybackState = 'playing' | 'paused' | 'stopped' | 'buffering';
export type RepeatMode = 'off' | 'Playlist' | 'track';
export type AudioQuality = '96kbps' | '160kbps' | '320kbps';

export type ArtworkColors = {
  primary: string;
  background: string;
  secondary: string;
  detail: string;
};
