import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { SheetModal } from '@/components/SheetModal';
import { useNewRelease } from '@/hooks/useOtaUpdates';
import { appVersion, skipRelease, updateKind } from '@/services/ota';
import { colors, radii, spacing, typography } from '@/theme';

/** Offers a newer GitHub release once per launch; Not Now (or swiping it away) skips that version. */
export function UpdateAvailableSheet() {
  const release = useNewRelease();
  const [closed, setClosed] = useState(false);

  if (!release) return null;

  const visible = !closed;
  const handleUpdate = () => {
    void Linking.openURL(release.url);
    setClosed(true);
  };
  const handleNotNow = () => {
    skipRelease(release.version);
    setClosed(true);
  };

  return (
    <SheetModal visible={visible} onClose={() => visible && handleNotNow()}>
      <View style={styles.content}>
        <AppIcon name="newVersion" size={48} color={colors.accent} />
        <Text style={styles.title}>New Version Available</Text>

        <View style={styles.versions}>
          <View style={styles.version}>
            <Text style={styles.versionLabel}>Current</Text>
            <Text style={styles.versionValue}>{appVersion}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.version}>
            <Text style={styles.versionLabel}>New</Text>
            <Text style={styles.versionValue}>{release.version}</Text>
          </View>
        </View>

        <Text style={styles.description}>
          {updateKind(release.version, appVersion)} update is now available.
        </Text>

        <View style={styles.actions}>
          <Pressable
            onPress={handleUpdate}
            style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}
            accessibilityRole="button"
          >
            <Text style={styles.primaryLabel}>Update Now</Text>
          </Pressable>
          <Pressable
            onPress={handleNotNow}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryLabel}>Not Now</Text>
          </Pressable>
        </View>
      </View>
    </SheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.sectionHeader,
    color: colors.text,
  },
  versions: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  version: {
    alignItems: 'center',
    gap: spacing.xxs,
  },
  versionLabel: {
    ...typography.metadata,
    color: colors.textSecondary,
  },
  versionValue: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    alignSelf: 'stretch',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  button: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
  },
  primary: {
    backgroundColor: colors.accent,
  },
  pressed: {
    opacity: 0.7,
  },
  primaryLabel: {
    ...typography.bodyStrong,
    color: colors.onAccent,
  },
  secondaryLabel: {
    ...typography.bodyStrong,
    color: colors.accent,
  },
});
