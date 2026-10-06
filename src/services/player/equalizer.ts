import { Equalizer } from 'react-native-nitro-player';

export async function setEqualizerEnabled(enabled: boolean): Promise<void> {
  await Equalizer.setEnabled(enabled);
}

export async function applyEqualizerPreset(presetName: string): Promise<void> {
  await Equalizer.applyPreset(presetName);
}

/** Built-in preset names. */
export function getEqualizerPresets(): string[] {
  return Equalizer.getBuiltInPresets().map((p) => p.name);
}
