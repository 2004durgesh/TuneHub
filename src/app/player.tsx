import { Host, Slider } from '@expo/ui';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { usePlayerStore, useSettingsStore } from '@/store';
import { usePlayer } from '@/hooks/usePlayer';
import { useLikedSongs } from '@/hooks/useLikedSongs';
import { useArtworkColors } from '@/hooks/useArtworkColors';
import { setRepeat as setRepeatService, shuffleUpcoming } from '@/services/player';
import { Artwork } from '@/components/Artwork';
import { AppIcon } from '@/components/app-icon';
import { SongActionSheet } from '@/components/SongActionSheet';
import { AddToPlaylistSheet } from '@/components/AddToPlaylistSheet';
import { colors, hexColors, radii, screenPadding, spacing, timings, typography } from '@/theme';
import type { RepeatMode, Song } from '@/types';

// ---------------------------------------------------------------------------
// Route config — mark this file as a modal
// ---------------------------------------------------------------------------
export const unstable_settings = { initialRouteName: '(tabs)' };

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ARTWORK_SIZE = SCREEN_WIDTH - spacing.xl * 2;
const ICON_BTN_SIZE = 44;
const PLAY_BTN_SIZE = 56;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

const REPEAT_CYCLE: RepeatMode[] = ['off', 'Playlist', 'track'];

function nextRepeatMode(current: RepeatMode): RepeatMode {
  const idx = REPEAT_CYCLE.indexOf(current);
  return REPEAT_CYCLE[(idx + 1) % REPEAT_CYCLE.length];
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function PlayerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Player state & controls
  const { currentSong, position, duration, isPlaying, togglePlayPause, next, previous, seek } =
    usePlayer();

  // Like state
  const { isLiked, toggleLike } = useLikedSongs();

  // Repeat & shuffle from store
  const repeat = usePlayerStore((s) => s.repeat);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const setRepeatStore = usePlayerStore((s) => s.setRepeat);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);

  // Action sheet for the current song
  const [sheetSong, setSheetSong] = useState<Song | null>(null);
  const [addToPlaylistSong, setAddToPlaylistSong] = useState<Song | null>(null);

  // Dynamic artwork atmosphere
  const dynamicAtmosphere = useSettingsStore((s) => s.dynamicAtmosphere);
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);
  const artworkColors = useArtworkColors(currentSong?.artworkUrl);
  const atmosphere = useSharedValue<string>(hexColors.background);

  useEffect(() => {
    const target =
      dynamicAtmosphere && artworkColors ? artworkColors.background : hexColors.background;
    atmosphere.value = reducedMotion ? target : withTiming(target, timings.atmosphere);
  }, [artworkColors, dynamicAtmosphere, reducedMotion, atmosphere]);

  const atmosphereStyle = useAnimatedStyle(() => ({ backgroundColor: atmosphere.value }));

  // Derived values
  const liked = currentSong ? isLiked(currentSong.id) : false;
  const repeatIconName = repeat === 'track' ? 'repeatOne' : 'repeat';
  const repeatActive = repeat !== 'off';
  const repeatColor = repeatActive ? colors.accent : colors.textSecondary;
  const shuffleColor = shuffle ? colors.accent : colors.textSecondary;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleRepeat = useCallback(async () => {
    const next = nextRepeatMode(repeat);
    setRepeatStore(next);
    await setRepeatService(next);
  }, [repeat, setRepeatStore]);

  const handleShuffle = useCallback(() => {
    const enabling = !shuffle;
    toggleShuffle();
    if (enabling && currentSong) void shuffleUpcoming(currentSong.id);
  }, [shuffle, currentSong, toggleShuffle]);

  const handleLike = useCallback(() => {
    if (currentSong) toggleLike(currentSong);
  }, [currentSong, toggleLike]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + spacing.sm,
          paddingBottom: insets.bottom + spacing.md,
        },
      ]}
    >
      {/* ── Dynamic artwork atmosphere (subtle tint over the dark base) ── */}
      <Animated.View style={[styles.atmosphere, atmosphereStyle]} pointerEvents="none" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()} hitSlop={8}>
          <AppIcon name="chevronDown" size={24} color={colors.text} />
        </Pressable>

        <Text style={styles.headerTitle}>NOW PLAYING</Text>

        <Pressable style={styles.iconBtn} onPress={() => setSheetSong(currentSong)} hitSlop={8}>
          <AppIcon name="more" size={24} color={colors.text} />
        </Pressable>
      </View>

      {/* ── Artwork ── */}
      <View style={styles.artworkWrapper}>
        <Artwork
          uri={currentSong?.artworkUrl ?? ''}
          size={ARTWORK_SIZE}
          borderRadius={radii.artwork}
        />
      </View>

      {/* ── Song info row: [like] [title/artist] [spacer] ── */}
      <View style={styles.infoRow}>
        <Pressable style={styles.iconBtn} onPress={handleLike} hitSlop={8}>
          <AppIcon
            name={liked ? 'heartFill' : 'heart'}
            size={24}
            color={liked ? colors.like : colors.textSecondary}
          />
        </Pressable>

        <View style={styles.titleArea}>
          <Text style={styles.title} numberOfLines={1}>
            {currentSong?.title ?? '—'}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentSong?.artistName ?? '—'}
          </Text>
        </View>

        {/* Empty view mirrors the like button for visual balance */}
        <View style={styles.iconBtn} />
      </View>

      {/* ── Progress bar ── */}
      <View style={styles.progressRow}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>

        <Host style={styles.sliderHost}>
          <Slider
            value={position}
            min={0}
            max={Math.max(duration, 1)}
            onValueChange={(v) => seek(v)}
          />
        </Host>

        <Text style={[styles.timeText, styles.timeTextRight]}>
          -{formatTime(Math.max(0, duration - position))}
        </Text>
      </View>

      {/* ── Main controls: prev | play/pause | next ── */}
      <View style={styles.mainControls}>
        <Pressable style={styles.controlBtn} onPress={previous} hitSlop={8}>
          <AppIcon name="prev" size={32} color={colors.text} />
        </Pressable>

        <Pressable style={styles.playBtn} onPress={togglePlayPause} hitSlop={8}>
          <AppIcon name={isPlaying ? 'pause' : 'play'} size={36} color={colors.text} />
        </Pressable>

        <Pressable style={styles.controlBtn} onPress={next} hitSlop={8}>
          <AppIcon name="next" size={32} color={colors.text} />
        </Pressable>
      </View>

      {/* ── Secondary controls: repeat | lyrics | queue | shuffle ── */}
      <View style={styles.secondaryControls}>
        <Pressable style={styles.iconBtn} onPress={handleRepeat} hitSlop={8}>
          <AppIcon name={repeatIconName} size={22} color={repeatColor} />
        </Pressable>

        <Pressable style={styles.iconBtn} onPress={() => router.push('/lyrics')} hitSlop={8}>
          <AppIcon
            name="lyrics"
            size={22}
            color={currentSong?.lyricsId ? colors.textSecondary : colors.textTertiary}
          />
        </Pressable>

        <Pressable style={styles.iconBtn} onPress={() => router.push('/queue')} hitSlop={8}>
          <AppIcon name="queue" size={22} color={colors.textSecondary} />
        </Pressable>

        <Pressable style={styles.iconBtn} onPress={handleShuffle} hitSlop={8}>
          <AppIcon name="shuffle" size={22} color={shuffleColor} />
        </Pressable>
      </View>

      <SongActionSheet
        song={sheetSong}
        onClose={() => setSheetSong(null)}
        onAddToPlaylist={() => setAddToPlaylistSong(sheetSong)}
      />
      <AddToPlaylistSheet song={addToPlaylistSong} onClose={() => setAddToPlaylistSong(null)} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: screenPadding,
  },
  atmosphere: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.55,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },

  // Artwork
  artworkWrapper: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  // Info row
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconBtn: {
    width: ICON_BTN_SIZE,
    height: ICON_BTN_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  title: {
    ...typography.sectionHeader,
    fontWeight: '700',
    color: colors.text,
  },
  artist: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },

  // Progress bar
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  sliderHost: {
    flex: 1,
  },
  timeText: {
    ...typography.caption,
    color: colors.textTertiary,
    minWidth: 36,
    textAlign: 'center',
  },
  timeTextRight: {
    textAlign: 'center',
  },

  // Main controls
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginBottom: spacing.lg,
  },
  controlBtn: {
    width: ICON_BTN_SIZE,
    height: ICON_BTN_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: PLAY_BTN_SIZE,
    height: PLAY_BTN_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Secondary controls
  secondaryControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },
});
