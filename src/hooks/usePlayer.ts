import { useCallback, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { Song } from '@/types';
import { usePlayerStore, useSettingsStore } from '@/store';
import { recordPlay } from './useHistory';
import {
  setupPlayer,
  subscribePlayback,
  playNow as playNowService,
  play as playService,
  pause as pauseService,
  next as nextService,
  previous as previousService,
  seek as seekService,
  setEqualizerEnabled,
  applyEqualizerPreset,
} from '@/services/player';

/**
 * Bridges the native player events into `playerStore` and exposes transport
 * actions. Mount ONCE near the app root (e.g. in the root layout) so the
 * subscription and setup run a single time.
 */
export function usePlayerBridge() {
  const { setCurrentSong, setPlaybackState, setProgress } = usePlayerStore(
    useShallow((s) => ({
      setCurrentSong: s.setCurrentSong,
      setPlaybackState: s.setPlaybackState,
      setProgress: s.setProgress,
    })),
  );

  useEffect(() => {
    setupPlayer();
    // Apply any persisted equalizer settings once the player is up.
    const { equalizerEnabled, equalizerPreset } = useSettingsStore.getState();
    if (equalizerEnabled) {
      void setEqualizerEnabled(true);
      void applyEqualizerPreset(equalizerPreset);
    }
    const unsubscribe = subscribePlayback({
      onTrackChange: (song) => {
        setCurrentSong(song);
        if (song) recordPlay(song);
      },
      onStateChange: setPlaybackState,
      onProgress: setProgress,
    });
    return unsubscribe;
  }, [setCurrentSong, setPlaybackState, setProgress]);
}

/**
 * Playback controls + current state for any screen/component. Position isn't included: it ticks
 * every second, and it would re-render every caller — use `usePlaybackProgress` where it's shown.
 */
export function usePlayer() {
  const currentSong = usePlayerStore((s) => s.currentSong);
  const playbackState = usePlayerStore((s) => s.playbackState);

  // Shuffle is a mode: with it on, a new list starts at the tapped song and the rest play shuffled.
  const playSongs = useCallback((songs: Song[], startIndex = 0) => {
    return playNowService(songs, startIndex, usePlayerStore.getState().shuffle);
  }, []);

  const togglePlayPause = useCallback(() => {
    return playbackState === 'playing' ? pauseService() : playService();
  }, [playbackState]);

  // Reflect a seek right away; nitro's next progress report can be up to a second out, and the
  // seek bar and time label would show the old position until then.
  const seek = useCallback((seconds: number) => {
    const { duration: total, setProgress } = usePlayerStore.getState();
    setProgress(seconds, total);
    return seekService(seconds);
  }, []);

  return {
    currentSong,
    playbackState,
    isPlaying: playbackState === 'playing',
    playSongs,
    togglePlayPause,
    next: nextService,
    previous: previousService,
    seek,
  };
}

export function usePlaybackProgress() {
  return usePlayerStore(useShallow((s) => ({ position: s.position, duration: s.duration })));
}
