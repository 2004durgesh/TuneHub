import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AppIcon } from '@/components/app-icon';
import { useLikedSongs } from '@/hooks/useLikedSongs';
import { MINI_PLAYER_HEIGHT } from '@/hooks/useMiniPlayerPlacement';
import { usePlayer } from '@/hooks/usePlayer';
import { usePlayerStore, useSettingsStore } from '@/store';
import { colors, hexColors, spacing, timings, typography } from '@/theme';
import type { ArtworkColors } from '@/types';

const PROGRESS_HEIGHT = 2;

// NowPlaying draws the (morphing) artwork over this empty slot, so these must match the layout.
export const MINI_ART_SIZE = 48;
export const MINI_ART_LEFT = spacing.sm;
export const MINI_ART_TOP =
  PROGRESS_HEIGHT + (MINI_PLAYER_HEIGHT - PROGRESS_HEIGHT - MINI_ART_SIZE) / 2;

type Props = {
  width: number;
  palette: ArtworkColors | null;
  onExpand: () => void;
};

/** Collapsed now-playing bar: progress line, title, like / play / next. */
export function MiniBar({ width, palette, onExpand }: Props) {
  const { currentSong, isPlaying, togglePlayPause, next } = usePlayer();
  const { toggleLike, isLiked } = useLikedSongs();
  const position = usePlayerStore((s) => s.position);
  const duration = usePlayerStore((s) => s.duration);
  const dynamicAtmosphere = useSettingsStore((s) => s.dynamicAtmosphere);

  const progress = useSharedValue(0);
  const trackWidth = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(position / Math.max(duration, 1), timings.fast);
  }, [position, duration, progress]);
  const progressStyle = useAnimatedStyle(() => ({ width: trackWidth.value * progress.value }));

  const tint = useSharedValue<string>(hexColors.surface);
  useEffect(() => {
    tint.value =
      dynamicAtmosphere && palette
        ? withTiming(palette.primary, timings.atmosphere)
        : hexColors.surface;
  }, [palette, dynamicAtmosphere, tint]);
  const tintStyle = useAnimatedStyle(() => ({ backgroundColor: tint.value }));

  if (!currentSong) return null;
  const liked = isLiked(currentSong.id);

  return (
    <View style={[styles.bar, { width }]}>
      <Animated.View style={[styles.tint, tintStyle]} pointerEvents="none" />

      <View
        style={styles.progressTrack}
        onLayout={(e) => {
          trackWidth.value = e.nativeEvent.layout.width;
        }}
      >
        <Animated.View style={[styles.progressFill, progressStyle]} />
      </View>

      <Pressable
        style={styles.content}
        onPress={onExpand}
        accessibilityRole="button"
        accessibilityLabel="Open player"
      >
        <View style={styles.artSlot} />

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentSong.artistName}
          </Text>
        </View>

        <Pressable
          hitSlop={spacing.sm}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            toggleLike(currentSong);
          }}
        >
          <AppIcon
            name={liked ? 'heartFill' : 'heart'}
            size={20}
            color={liked ? colors.like : colors.textSecondary}
          />
        </Pressable>

        <Pressable hitSlop={spacing.sm} onPress={togglePlayPause}>
          <AppIcon name={isPlaying ? 'pause' : 'play'} size={24} color={colors.text} />
        </Pressable>

        <Pressable hitSlop={spacing.sm} onPress={next}>
          <AppIcon name="next" size={24} color={colors.text} />
        </Pressable>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: MINI_PLAYER_HEIGHT,
  },
  tint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.12,
  },
  progressTrack: {
    height: PROGRESS_HEIGHT,
    backgroundColor: colors.surfaceHigh,
  },
  progressFill: {
    height: PROGRESS_HEIGHT,
    backgroundColor: colors.accent,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MINI_ART_LEFT,
    gap: spacing.sm,
  },
  artSlot: {
    width: MINI_ART_SIZE,
    height: MINI_ART_SIZE,
  },
  textContainer: {
    flex: 1,
    gap: spacing.xxs,
  },
  title: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  artist: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
