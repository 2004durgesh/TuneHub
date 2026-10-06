import { TrackPlayer } from 'react-native-nitro-player';
import type { PlaybackState, Song } from '@/types';
import { trackToSong } from './trackAdapter';

// Registers TrackPlayer event callbacks and forwards them as plain domain values.

export type PlaybackHandlers = {
  onTrackChange?: (song: Song | null) => void;
  onStateChange?: (state: PlaybackState) => void;
  onProgress?: (position: number, duration: number) => void;
};

/**
 * Wire TrackPlayer callbacks to the given handlers. Returns a cleanup that
 * detaches by registering no-op callbacks (the native API is single-callback
 * per event, so we can't truly remove — the no-op prevents stale references).
 */
export function subscribePlayback(handlers: PlaybackHandlers): () => void {
  if (handlers.onTrackChange) {
    TrackPlayer.onChangeTrack((track) => {
      handlers.onTrackChange?.(track ? trackToSong(track) : null);
    });
  }
  if (handlers.onStateChange) {
    TrackPlayer.onPlaybackStateChange((state) => {
      handlers.onStateChange?.(state as PlaybackState);
    });
  }
  if (handlers.onProgress) {
    TrackPlayer.onPlaybackProgressChange((position, duration) => {
      handlers.onProgress?.(position, duration);
    });
  }

  return () => {
    TrackPlayer.onChangeTrack(() => {});
    TrackPlayer.onPlaybackStateChange(() => {});
    TrackPlayer.onPlaybackProgressChange(() => {});
  };
}
