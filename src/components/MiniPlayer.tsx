import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Artwork } from '@/components/Artwork';
import { AppIcon } from '@/components/app-icon';
import { usePlayer } from '@/hooks/usePlayer';
import { useLikedSongs } from '@/hooks/useLikedSongs';
import { useArtworkColors } from '@/hooks/useArtworkColors';
import { usePlayerStore } from '@/store/playerStore';
import { useSettingsStore } from '@/store/settingsStore';
import { colors, spacing, radii, typography, springs, timings } from '@/theme';

// Design constants — not in theme
const MINI_PLAYER_HEIGHT = 64;
const ARTWORK_SIZE = 48;
const PROGRESS_HEIGHT = 2;

type Props = {
  style?: StyleProp<ViewStyle>;
};

export default function MiniPlayer({ style }: Props) {
  const router = useRouter();
  const { currentSong, isPlaying, togglePlayPause, next } = usePlayer();
  const { toggleLike, isLiked } = useLikedSongs();

  // Read position/duration directly from the store (plain numbers)
  const position = usePlayerStore((s) => s.position);
  const duration = usePlayerStore((s) => s.duration);

  // ── Visibility animation ─────────────────────────────────────────────────
  const translateY = useSharedValue(72);

  useEffect(() => {
    translateY.value = withSpring(currentSong ? 0 : 72, springs.smooth);
  }, [currentSong, translateY]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // ── Progress bar ─────────────────────────────────────────────────────────
  const progressShared = useSharedValue(0);
  const trackWidth = useSharedValue(0);

  useEffect(() => {
    progressShared.value = withTiming(position / Math.max(duration, 1), timings.fast);
  }, [position, duration, progressShared]);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: trackWidth.value * progressShared.value,
  }));

  // ── Faint artwork atmosphere tint ────────────────────────────────────────
  const dynamicAtmosphere = useSettingsStore((s) => s.dynamicAtmosphere);
  const artworkColors = useArtworkColors(currentSong?.artworkSmall);
  const tint = useSharedValue<string>(colors.surface);

  useEffect(() => {
    tint.value =
      dynamicAtmosphere && artworkColors
        ? withTiming(artworkColors.primary, timings.atmosphere)
        : colors.surface;
  }, [artworkColors, dynamicAtmosphere, tint]);

  const tintStyle = useAnimatedStyle(() => ({ backgroundColor: tint.value }));

  // Hidden entirely when nothing is playing (all hooks run above this guard).
  if (currentSong === null) return null;

  const liked = isLiked(currentSong.id);

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle, style]}>
      {/* Faint artwork tint behind content */}
      <Animated.View style={[styles.tint, tintStyle]} pointerEvents="none" />

      {/* Progress bar — sits at very top, full-width track */}
      <View
        style={styles.progressTrack}
        onLayout={(e) => {
          trackWidth.value = e.nativeEvent.layout.width;
        }}
      >
        <Animated.View style={[styles.progressFill, progressAnimatedStyle]} />
      </View>

      {/* Content */}
      <Pressable style={styles.content} onPress={() => router.push('/player')}>
        <Artwork uri={currentSong.artworkSmall} size={ARTWORK_SIZE} />

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentSong.artistName}
          </Text>
        </View>

        {/* Like */}
        <Pressable
          hitSlop={spacing.sm}
          onPress={(e) => {
            e.stopPropagation();
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

        {/* Play / Pause */}
        <Pressable
          hitSlop={spacing.sm}
          onPress={(e) => {
            e.stopPropagation();
            togglePlayPause();
          }}
        >
          <AppIcon name={isPlaying ? 'pause' : 'play'} size={24} color={colors.text} />
        </Pressable>

        {/* Next */}
        <Pressable
          hitSlop={spacing.sm}
          onPress={(e) => {
            e.stopPropagation();
            next();
          }}
        >
          <AppIcon name="next" size={24} color={colors.text} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: MINI_PLAYER_HEIGHT,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.card,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
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
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
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
