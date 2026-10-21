import { useEffect, useSyncExternalStore } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { MINI_PLAYER_HEIGHT, useMiniPlayerPlacement } from '@/hooks/useMiniPlayerPlacement';
import { usePlayerStore, useSettingsStore } from '@/store';
import { colors, radii, spacing, typography } from '@/theme';

const VISIBLE_MS = 3500;

type ToastAction = { label: string; onPress: () => void };
type ToastMessage = { id: number; message: string; action?: ToastAction };

let current: ToastMessage | null = null;
let nextId = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function hide(id: number) {
  if (current?.id !== id) return;
  current = null;
  emit();
}

/** Shows a short confirmation above the mini player; a newer toast replaces the current one. */
export function showToast(message: string, action?: ToastAction) {
  current = { id: nextId++, message, action };
  emit();
  AccessibilityInfo.announceForAccessibility(message);
}

/** Mount once in the root layout, after `NowPlaying` so it draws above the player. */
export function Toast() {
  const toast = useSyncExternalStore(subscribe, () => current);
  return toast ? <ToastCard key={toast.id} toast={toast} /> : null;
}

function ToastCard({ toast }: { toast: ToastMessage }) {
  const placement = useMiniPlayerPlacement();
  const hasSong = usePlayerStore((s) => s.currentSong !== null);
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);

  useEffect(() => {
    const timer = setTimeout(() => hide(toast.id), VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [toast.id]);

  const bottom = placement.bottom + (hasSong ? MINI_PLAYER_HEIGHT + spacing.xs : 0);
  const { action } = toast;

  return (
    <Animated.View
      entering={reducedMotion ? undefined : FadeInDown}
      exiting={reducedMotion ? undefined : FadeOutDown}
      style={[styles.toast, { bottom }]}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.row}>
        <Text style={styles.message} numberOfLines={2}>
          {toast.message}
        </Text>
        {action && (
          <Pressable
            onPress={() => {
              hide(toast.id);
              action.onPress();
            }}
            hitSlop={spacing.xs}
            style={({ pressed }) => pressed && styles.pressed}
            accessibilityRole="button"
          >
            <Text style={styles.action}>{action.label}</Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.card,
    backgroundColor: colors.surfaceHigh,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  message: {
    ...typography.body,
    flex: 1,
    color: colors.text,
  },
  action: {
    ...typography.bodyStrong,
    color: colors.accent,
  },
  pressed: {
    opacity: 0.7,
  },
});
