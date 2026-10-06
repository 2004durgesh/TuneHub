import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Host, Switch } from '@expo/ui';
import Constants from 'expo-constants';
import { AppIcon } from '@/components/app-icon';
import { ThemedList, ThemedListItem } from '@/components/native/ThemedList';
import { useSettingsStore } from '@/store/settingsStore';
import { clearHistory } from '@/services/storage/history';
import { colors, spacing, typography } from '@/theme';

export default function SettingsScreen() {
  const router = useRouter();

  const dynamicAtmosphere = useSettingsStore((s) => s.dynamicAtmosphere);
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);
  const toggleAtmosphere = useSettingsStore((s) => s.toggleAtmosphere);
  const toggleReducedMotion = useSettingsStore((s) => s.toggleReducedMotion);

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  function handleClearHistory() {
    Alert.alert(
      'Clear Play History',
      'This will remove all songs from your play history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => clearHistory() },
      ],
    );
  }

  const chevron = <AppIcon name="chevronRight" size={16} color={colors.textTertiary} />;

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>Settings</Text>
      <Host style={styles.listHost} colorScheme="dark">
        <ThemedList>
          <ThemedListItem
            onPress={() => router.push('/settings/playback')}
            leading={<AppIcon name="play" size={20} color={colors.accent} />}
            trailing={chevron}
            supportingText="Streaming quality"
          >
            Audio Quality
          </ThemedListItem>
          <ThemedListItem
            onPress={() => router.push('/settings/playback')}
            leading={<AppIcon name="settings" size={20} color={colors.accent} />}
            trailing={chevron}
            supportingText="Presets & bands"
          >
            Equalizer
          </ThemedListItem>
          <ThemedListItem
            leading={<AppIcon name="album" size={20} color={colors.accent} />}
            trailing={<Switch value={dynamicAtmosphere} onValueChange={toggleAtmosphere} />}
            supportingText="Tint the player from artwork"
          >
            Dynamic Atmosphere
          </ThemedListItem>
          <ThemedListItem
            leading={<AppIcon name="more" size={20} color={colors.accent} />}
            trailing={<Switch value={reducedMotion} onValueChange={toggleReducedMotion} />}
            supportingText="Minimize animations"
          >
            Reduced Motion
          </ThemedListItem>
          <ThemedListItem
            leading={<AppIcon name="warning" size={20} color={colors.accent} />}
            supportingText={`Version ${appVersion}`}
          >
            About
          </ThemedListItem>
          <ThemedListItem
            onPress={handleClearHistory}
            leading={<AppIcon name="trash" size={20} color={colors.error} />}
          >
            Clear Play History
          </ThemedListItem>
        </ThemedList>
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    ...typography.screenTitle,
    color: colors.text,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  listHost: {
    flex: 1,
  },
});
