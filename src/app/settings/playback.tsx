import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Host, Switch } from '@expo/ui';
import * as Haptics from 'expo-haptics';
import { AppIcon } from '@/components/app-icon';
import { ThemedList, ThemedListItem } from '@/components/native/ThemedList';
import { useSettingsStore } from '@/store/settingsStore';
import {
  applyEqualizerPreset,
  setEqualizerEnabled as setEqEnabledService,
} from '@/services/player';
import { colors } from '@/theme';
import type { AudioQuality } from '@/types';

const QUALITY_OPTIONS: { value: AudioQuality; label: string; description: string }[] = [
  { value: '96kbps', label: '96 kbps', description: 'Smaller files' },
  { value: '160kbps', label: '160 kbps', description: 'Balanced' },
  { value: '320kbps', label: '320 kbps', description: 'Best quality' },
];

const EQ_PRESETS = [
  'Flat',
  'Rock',
  'Pop',
  'Jazz',
  'Classical',
  'Electronic',
  'Hip-Hop',
  'R&B',
  'Acoustic',
  'Bass Boost',
];

export default function PlaybackSettingsScreen() {
  const insets = useSafeAreaInsets();

  const audioQuality = useSettingsStore((s) => s.audioQuality);
  const setAudioQuality = useSettingsStore((s) => s.setAudioQuality);
  const equalizerEnabled = useSettingsStore((s) => s.equalizerEnabled);
  const setEqualizerEnabled = useSettingsStore((s) => s.setEqualizerEnabled);
  const equalizerPreset = useSettingsStore((s) => s.equalizerPreset);
  const setEqualizerPreset = useSettingsStore((s) => s.setEqualizerPreset);

  function handleQualitySelect(quality: AudioQuality) {
    setAudioQuality(quality);
    void Haptics.selectionAsync();
  }

  function handleEqualizerToggle(enabled: boolean) {
    setEqualizerEnabled(enabled);
    void setEqEnabledService(enabled);
    if (enabled) void applyEqualizerPreset(equalizerPreset);
  }

  function handlePresetSelect(preset: string) {
    setEqualizerPreset(preset);
    void applyEqualizerPreset(preset);
    void Haptics.selectionAsync();
  }

  const check = () => <AppIcon name="check" size={16} color={colors.accent} />;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Playback',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
        <Host style={styles.listHost} colorScheme="dark">
          <ThemedList>
            <ThemedListItem supportingText="Streaming quality">Audio Quality</ThemedListItem>
            {QUALITY_OPTIONS.map((opt) => {
              const selected = audioQuality === opt.value;
              return (
                <ThemedListItem
                  key={`${opt.value}-${selected}`}
                  onPress={() => handleQualitySelect(opt.value)}
                  supportingText={opt.description}
                  trailing={selected ? check() : undefined}
                >
                  {opt.label}
                </ThemedListItem>
              );
            })}

            <ThemedListItem
              trailing={<Switch value={equalizerEnabled} onValueChange={handleEqualizerToggle} />}
              supportingText="Presets & bands"
            >
              Equalizer
            </ThemedListItem>
            {equalizerEnabled &&
              EQ_PRESETS.map((preset) => {
                const selected = equalizerPreset === preset;
                return (
                  <ThemedListItem
                    key={`${preset}-${selected}`}
                    onPress={() => handlePresetSelect(preset)}
                    trailing={selected ? check() : undefined}
                  >
                    {preset}
                  </ThemedListItem>
                );
              })}
          </ThemedList>
        </Host>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listHost: {
    flex: 1,
  },
});
