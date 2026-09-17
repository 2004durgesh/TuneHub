import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/store/settingsStore';
import {
  applyEqualizerPreset,
  setEqualizerEnabled as setEqEnabledService,
} from '@/services/player';
import { colors, radii, spacing, typography } from '@/theme';
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
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Audio Quality section */}
          <Text style={styles.sectionLabel}>Audio Quality</Text>
          <View style={styles.section}>
            {QUALITY_OPTIONS.map((opt, index) => {
              const isSelected = audioQuality === opt.value;
              return (
                <View key={opt.value}>
                  {index > 0 && <View style={styles.separator} />}
                  <Pressable
                    style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                    onPress={() => handleQualitySelect(opt.value)}
                  >
                    <View style={styles.qualityTextContainer}>
                      <Text style={styles.rowLabel}>{opt.label}</Text>
                      <Text style={styles.rowDescription}>{opt.description}</Text>
                    </View>
                    {isSelected && <View style={styles.checkDot} />}
                  </Pressable>
                </View>
              );
            })}
          </View>

          {/* Equalizer section */}
          <Text style={styles.sectionLabel}>Equalizer</Text>
          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Equalizer</Text>
              <Switch
                value={equalizerEnabled}
                onValueChange={handleEqualizerToggle}
                thumbColor={colors.text}
                trackColor={{
                  false: colors.surfaceHigh,
                  true: colors.accent,
                }}
              />
            </View>

            {equalizerEnabled &&
              EQ_PRESETS.map((preset) => {
                const isSelected = equalizerPreset === preset;
                return (
                  <View key={preset}>
                    <View style={styles.separator} />
                    <Pressable
                      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                      onPress={() => handlePresetSelect(preset)}
                    >
                      <Text style={[styles.rowLabel, isSelected && styles.rowLabelAccent]}>
                        {preset}
                      </Text>
                      {isSelected && <View style={styles.checkDot} />}
                    </Pressable>
                  </View>
                );
              })}
          </View>

          <View style={{ height: spacing.xl }} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  rowPressed: {
    backgroundColor: colors.surfaceHigh,
  },
  rowLabel: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  rowLabelAccent: {
    color: colors.accent,
  },
  rowDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  qualityTextContainer: {
    flex: 1,
    gap: spacing.xxs,
  },
  checkDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
});
