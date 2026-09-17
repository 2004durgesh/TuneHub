import { Platform } from 'react-native';

// Same lazy/guarded access pattern as nitroPlayer.ts — nitro-player throws at
// import on web/Expo Go, so everything here no-ops when it's unavailable.
type NitroModule = typeof import('react-native-nitro-player');

let mod: NitroModule | null = null;
function getMod(): NitroModule | null {
  if (Platform.OS === 'web') return null;
  if (mod) return mod;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    mod = require('react-native-nitro-player');
    return mod;
  } catch {
    return null;
  }
}

export async function setEqualizerEnabled(enabled: boolean): Promise<void> {
  const m = getMod();
  if (!m) return;
  await m.Equalizer.setEnabled(enabled);
}

export async function applyEqualizerPreset(presetName: string): Promise<void> {
  const m = getMod();
  if (!m) return;
  await m.Equalizer.applyPreset(presetName);
}

/** Built-in preset names, or [] when the native module is unavailable. */
export function getEqualizerPresets(): string[] {
  const m = getMod();
  if (!m) return [];
  return m.Equalizer.getBuiltInPresets().map((p) => p.name);
}
