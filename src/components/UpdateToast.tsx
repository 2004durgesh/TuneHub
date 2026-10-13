import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useHasActiveDownloads } from '@/hooks/useDownloads';
import { restartApp } from '@/services/ota';
import { useOtaStore, useSettingsStore } from '@/store';
import { colors, radii, spacing, typography } from '@/theme';

const READY_VISIBLE_MS = 8000;

export function UpdateToast() {
  const { top } = useSafeAreaInsets();
  const status = useOtaStore((s) => s.status);
  const percent = useOtaStore((s) => s.percent);
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);
  const hasActiveDownloads = useHasActiveDownloads();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (status !== 'ready') return;
    const timer = setTimeout(() => setDismissed(true), READY_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [status]);

  if (status === 'idle' || dismissed) return null;

  const ready = status === 'ready';
  const subtitle = !ready
    ? percent === null
      ? 'Starting…'
      : `${percent}%`
    : hasActiveDownloads
      ? 'Applies next launch, or restart once downloads finish'
      : 'Restart to apply it now, or it applies next launch';

  return (
    <Animated.View
      entering={reducedMotion ? undefined : FadeInUp}
      exiting={reducedMotion ? undefined : FadeOutUp}
      style={[styles.toast, { top: top + spacing.xs }]}
    >
      <View style={styles.row}>
        <View style={styles.text}>
          <Text style={styles.title}>{ready ? 'Update ready' : 'Downloading update'}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {ready && !hasActiveDownloads && (
          <Pressable
            onPress={restartApp}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
            accessibilityRole="button"
          >
            <Text style={styles.actionLabel}>Restart</Text>
          </Pressable>
        )}
      </View>
      {!ready && (
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${percent ?? 0}%` }]} />
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderRadius: radii.card,
    backgroundColor: colors.surfaceHigh,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
  title: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  subtitle: {
    ...typography.metadata,
    color: colors.textSecondary,
  },
  action: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    backgroundColor: colors.accent,
  },
  pressed: {
    opacity: 0.7,
  },
  actionLabel: {
    ...typography.bodyStrong,
    color: colors.onAccent,
  },
  track: {
    height: spacing.xxs,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
});
