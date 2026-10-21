import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { Song } from '@/types';
import { usePlayerStore, useSettingsStore } from '@/store';
import { loadArtworkImage } from './useArtworkImage';
import { recordPlay } from './useHistory';
import {
  getUpNextSong,
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
  useEffect(() => {
    const { setCurrentSong, setPlaybackState, setProgress } = usePlayerStore.getState();
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
        if (!song) return;
        recordPlay(song);
        // Warm the next cover so skipping dissolves straight into it.
        void getUpNextSong()
          .then((upNext) => upNext && loadArtworkImage(upNext.artworkUrl))
          .catch(() => {});
      },
      onStateChange: setPlaybackState,
      onProgress: setProgress,
    });
    return unsubscribe;
  }, []);
}

// Shuffle is a mode: with it on, a new list starts at the tapped song and the rest play shuffled.
export function playSongs(songs: Song[], startIndex = 0) {
  return playNowService(songs, startIndex, usePlayerStore.getState().shuffle);
}

// Reflect a seek right away; nitro's next progress report can be up to a second out, and the
// seek bar and time label would show the old position until then.
function seek(seconds: number) {
  const { duration: total, setProgress } = usePlayerStore.getState();
  setProgress(seconds, total);
  return seekService(seconds);
}

/**
 * Playback controls + current state for any screen/component. Position isn't included: it ticks
 * every second, and it would re-render every caller — use `usePlaybackProgress` where it's shown.
 * Screens that only start playback import `playSongs` instead; this re-renders on every track and
 * play/pause change.
 */
export function usePlayer() {
  const currentSong = usePlayerStore((s) => s.currentSong);
  const playbackState = usePlayerStore((s) => s.playbackState);

  return {
    currentSong,
    playbackState,
    isPlaying: playbackState === 'playing',
    playSongs,
    togglePlayPause: () => (playbackState === 'playing' ? pauseService() : playService()),
    next: nextService,
    previous: previousService,
    seek,
  };
}

/** The current song's id, for highlighting its row; doesn't re-render on play/pause. */
export function useCurrentSongId() {
  return usePlayerStore((s) => s.currentSong?.id);
}

const playedFraction = ({ position, duration }: { position: number; duration: number }) =>
  position / Math.max(duration, 1);

/** How much of the current track has played (0–1), read without subscribing. */
export const getPlayedFraction = () => playedFraction(usePlayerStore.getState());

/** Calls `onChange` with the played fraction as playback moves, without re-rendering anything. */
export function subscribePlayedFraction(onChange: (fraction: number) => void) {
  return usePlayerStore.subscribe((state, prev) => {
    if (state.position === prev.position && state.duration === prev.duration) return;
    onChange(playedFraction(state));
  });
}

export function usePlaybackProgress() {
  return usePlayerStore(useShallow((s) => ({ position: s.position, duration: s.duration })));
}
