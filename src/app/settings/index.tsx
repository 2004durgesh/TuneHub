import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { AppIcon } from '@/components/app-icon';
import { useSettingsStore } from '@/store/settingsStore';
import { clearHistory } from '@/services/storage/history';
import { colors, radii, spacing, typography } from '@/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => clearHistory(),
        },
      ],
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Text style={styles.header}>Settings</Text>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Playback section */}
        <Text style={styles.sectionLabel}>Playback</Text>
        <View style={styles.section}>
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => router.push('/settings/playback')}
          >
            <AppIcon name="play" size={20} color={colors.textSecondary} />
            <Text style={styles.rowLabel}>Audio Quality</Text>
            <View style={styles.rowRight}>
              <AppIcon name="chevronRight" size={16} color={colors.textTertiary} />
            </View>
          </Pressable>

          <View style={styles.separator} />

          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => router.push('/settings/playback')}
          >
            <AppIcon name="settings" size={20} color={colors.textSecondary} />
            <Text style={styles.rowLabel}>Equalizer</Text>
            <View style={styles.rowRight}>
              <AppIcon name="chevronRight" size={16} color={colors.textTertiary} />
            </View>
          </Pressable>
        </View>

        {/* Appearance section */}
        <Text style={styles.sectionLabel}>Appearance</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <AppIcon name="album" size={20} color={colors.textSecondary} />
            <Text style={styles.rowLabel}>Dynamic Atmosphere</Text>
            <View style={styles.rowRight}>
              <Switch
                value={dynamicAtmosphere}
                onValueChange={toggleAtmosphere}
                thumbColor={colors.text}
                trackColor={{
                  false: colors.surfaceHigh,
                  true: colors.accent,
                }}
              />
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.row}>
            <AppIcon name="more" size={20} color={colors.textSecondary} />
            <Text style={styles.rowLabel}>Reduced Motion</Text>
            <View style={styles.rowRight}>
              <Switch
                value={reducedMotion}
                onValueChange={toggleReducedMotion}
                thumbColor={colors.text}
                trackColor={{
                  false: colors.surfaceHigh,
                  true: colors.accent,
                }}
              />
            </View>
          </View>
        </View>

        {/* About section */}
        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <AppIcon name="warning" size={20} color={colors.textSecondary} />
            <Text style={styles.rowLabel}>Version</Text>
            <View style={styles.rowRight}>
              <Text style={styles.rowRightLabel}>{appVersion}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={handleClearHistory}
          >
            <AppIcon name="trash" size={20} color={colors.error} />
            <Text style={[styles.rowLabel, styles.rowLabelError]}>Clear Play History</Text>
          </Pressable>
        </View>

        <View style={{ height: insets.bottom + spacing.lg }} />
      </ScrollView>
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
    marginBottom: spacing.lg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
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
    marginLeft: spacing.md + 20 + spacing.sm, // icon indent
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
  rowLabelError: {
    color: colors.error,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rowRightLabel: {
    ...typography.metadata,
    color: colors.textSecondary,
  },
});
