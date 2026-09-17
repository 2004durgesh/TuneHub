import { create } from 'zustand';
import type { ArtworkColors, PlaybackState, RepeatMode, Song } from '@/types';

// NOTE: this store must NOT import the player service — that would pull the
// native react-native-nitro-player import into the store layer. The hooks
// layer bridges player events into these pure setters.

type PlayerState = {
  currentSong: Song | null;
  playbackState: PlaybackState;
  position: number;
  duration: number;
  repeat: RepeatMode;
  shuffle: boolean;
  artworkColors: ArtworkColors | null;
};

type PlayerStore = PlayerState & {
  setCurrentSong: (song: Song | null) => void;
  setPlaybackState: (state: PlaybackState) => void;
  setProgress: (position: number, duration: number) => void;
  setRepeat: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
  setArtworkColors: (colors: ArtworkColors | null) => void;
  reset: () => void;
};

const initialState: PlayerState = {
  currentSong: null,
  playbackState: 'stopped',
  position: 0,
  duration: 0,
  repeat: 'off',
  shuffle: false,
  artworkColors: null,
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  ...initialState,

  setCurrentSong: (currentSong) => set({ currentSong }),
  setPlaybackState: (playbackState) => set({ playbackState }),
  setProgress: (position, duration) => set({ position, duration }),
  setRepeat: (repeat) => set({ repeat }),
  toggleShuffle: () => set({ shuffle: !get().shuffle }),
  setArtworkColors: (artworkColors) => set({ artworkColors }),
  reset: () => set({ ...initialState }),
}));
