import { create } from 'zustand';
import { storage } from '@/services/storage/mmkv';
import type { AudioQuality } from '@/types';

const STORAGE_KEY = 'settings';

type SettingsState = {
  audioQuality: AudioQuality;
  dynamicAtmosphere: boolean;
  reducedMotion: boolean;
  equalizerEnabled: boolean;
  equalizerPreset: string;
};

type SettingsStore = SettingsState & {
  setAudioQuality: (quality: AudioQuality) => void;
  toggleAtmosphere: () => void;
  toggleReducedMotion: () => void;
  setEqualizerEnabled: (enabled: boolean) => void;
  setEqualizerPreset: (preset: string) => void;
};

const defaults: SettingsState = {
  audioQuality: '320kbps',
  dynamicAtmosphere: true,
  reducedMotion: false,
  equalizerEnabled: false,
  equalizerPreset: 'Flat',
};

function hydrate(): SettingsState {
  const raw = storage.getString(STORAGE_KEY);
  if (!raw) return defaults;
  try {
    const parsed = JSON.parse(raw) as Partial<SettingsState>;
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

/** Persist the whole settings object back to MMKV under the 'settings' key. */
function persist(state: SettingsState): void {
  const snapshot: SettingsState = {
    audioQuality: state.audioQuality,
    dynamicAtmosphere: state.dynamicAtmosphere,
    reducedMotion: state.reducedMotion,
    equalizerEnabled: state.equalizerEnabled,
    equalizerPreset: state.equalizerPreset,
  };
  storage.set(STORAGE_KEY, JSON.stringify(snapshot));
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...hydrate(),

  setAudioQuality: (audioQuality) => {
    set({ audioQuality });
    persist(get());
  },
  toggleAtmosphere: () => {
    set({ dynamicAtmosphere: !get().dynamicAtmosphere });
    persist(get());
  },
  toggleReducedMotion: () => {
    set({ reducedMotion: !get().reducedMotion });
    persist(get());
  },
  setEqualizerEnabled: (equalizerEnabled) => {
    set({ equalizerEnabled });
    persist(get());
  },
  setEqualizerPreset: (equalizerPreset) => {
    set({ equalizerPreset });
    persist(get());
  },
}));
