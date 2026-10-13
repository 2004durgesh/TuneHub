import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, type SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddToPlaylistSheet } from '@/components/AddToPlaylistSheet';
import { AppIcon } from '@/components/app-icon';
import { SeekSlider } from '@/components/native/SeekSlider';
import { SongActionSheet } from '@/components/SongActionSheet';
import { useLikedSongs } from '@/hooks/useLikedSongs';
import { usePlayer } from '@/hooks/usePlayer';
import { setRepeat as setRepeatService, shuffleUpcoming } from '@/services/player';
import { usePlayerStore } from '@/store';
import { colors, screenPadding, spacing, typography } from '@/theme';
import type { RepeatMode, Song } from '@/types';
import { LyricsPanel } from './LyricsPanel';
import { QueuePanel } from './QueuePanel';

const ICON_BTN_SIZE = 44;
const INFO_BTN_SIZE = 40;
const CLOSE_BTN_SIZE = 32;
const PLAY_BTN_SIZE = 56;

export type Panel = 'lyrics' | 'queue' | null;

// NowPlaying draws the (morphing) artwork over the empty artwork slot below, so its frame is
// derived from the same layout: top padding + header row + header margin.
export function fullArtworkTop(insetTop: number): number {
  return insetTop + spacing.sm + ICON_BTN_SIZE + spacing.lg;
}
export function fullArtworkSize(width: number): number {
  return width - spacing.xl * 2;
}

const REPEAT_CYCLE: RepeatMode[] = ['off', 'Playlist', 'track'];
const PANEL_TITLE = { lyrics: 'LYRICS', queue: 'YOUR QUEUE' } as const;

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

type Props = {
  width: number;
  height: number;
  panel: Panel;
  /** The panel being drawn: also lyrics while a swipe up on the artwork is revealing them. */
  content: Panel;
  /** 0 = artwork, 1 = panel fully revealed. */
  reveal: SharedValue<number>;
  onOpenPanel: (panel: Exclude<Panel, null>) => void;
  onClosePanel: () => void;
  onCollapse: () => void;
};

/** Expanded player chrome; the artwork and backdrop are drawn by NowPlaying. */
export function FullPlayer({
  width,
  height,
  panel,
  content,
  reveal,
  onOpenPanel,
  onClosePanel,
  onCollapse,
}: Props) {
  const insets = useSafeAreaInsets();
  const { currentSong, position, duration, isPlaying, togglePlayPause, next, previous, seek } =
    usePlayer();
  const { isLiked, toggleLike } = useLikedSongs();

  const repeat = usePlayerStore((s) => s.repeat);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const setRepeatStore = usePlayerStore((s) => s.setRepeat);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);

  const [sheetSong, setSheetSong] = useState<Song | null>(null);
  const [addToPlaylistSong, setAddToPlaylistSong] = useState<Song | null>(null);
  const [scrub, setScrub] = useState<number | null>(null);
  const shownPosition = scrub ?? position;

  const liked = currentSong ? isLiked(currentSong.id) : false;
  const repeatColor = repeat !== 'off' ? colors.accent : colors.textSecondary;
  const shuffleColor = shuffle ? colors.accent : colors.textSecondary;

  const panelStyle = useAnimatedStyle(() => ({
    opacity: reveal.value,
    transform: [{ translateY: (1 - reveal.value) * spacing.xl }],
  }));

  const handleRepeat = useCallback(async () => {
    const nextMode = REPEAT_CYCLE[(REPEAT_CYCLE.indexOf(repeat) + 1) % REPEAT_CYCLE.length];
    setRepeatStore(nextMode);
    await setRepeatService(nextMode);
  }, [repeat, setRepeatStore]);

  const handleShuffle = useCallback(() => {
    const enabling = !shuffle;
    toggleShuffle();
    if (enabling) void shuffleUpcoming();
  }, [shuffle, toggleShuffle]);

  const handleQueue = () => (panel === 'queue' ? onClosePanel() : onOpenPanel('queue'));

  return (
    <View
      style={[
        styles.container,
        { width, height, paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          style={styles.iconBtn}
          onPress={onCollapse}
          hitSlop={8}
          accessibilityLabel="Close player"
        >
          <AppIcon name="chevronDown" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{panel ? PANEL_TITLE[panel] : 'NOW PLAYING'}</Text>
        <Pressable style={styles.iconBtn} onPress={() => setSheetSong(currentSong)} hitSlop={8}>
          <AppIcon name="more" size={24} color={colors.text} />
        </Pressable>
      </View>

      <View style={[styles.artworkSlot, { height: fullArtworkSize(width) }]}>
        {content && (
          <Animated.View style={[styles.panel, panelStyle]}>
            <View style={styles.panelBar}>
              <Pressable
                style={styles.closeBtn}
                onPress={onClosePanel}
                hitSlop={8}
                accessibilityLabel={content === 'lyrics' ? 'Close lyrics' : 'Close queue'}
              >
                <AppIcon name="close" size={16} color={colors.text} />
              </Pressable>
            </View>
            <Animated.View key={content} style={styles.panel} entering={FadeIn.duration(200)}>
              {content === 'lyrics' ? <LyricsPanel /> : <QueuePanel />}
            </Animated.View>
          </Animated.View>
        )}
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoSide}>
          <Pressable
            style={styles.infoBtn}
            onPress={() => currentSong && toggleLike(currentSong)}
            hitSlop={4}
            accessibilityLabel={liked ? 'Unlike' : 'Like'}
          >
            <AppIcon
              name={liked ? 'heartFill' : 'heart'}
              size={24}
              color={liked ? colors.like : colors.textSecondary}
            />
          </Pressable>
        </View>
        <View style={styles.titleArea}>
          <Text style={styles.title} numberOfLines={1}>
            {currentSong?.title ?? '—'}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentSong?.artistName ?? '—'}
          </Text>
        </View>
        <View style={[styles.infoSide, styles.infoSideEnd]}>
          <Pressable
            style={styles.infoBtn}
            onPress={handleShuffle}
            hitSlop={4}
            accessibilityLabel="Shuffle"
            accessibilityState={{ selected: shuffle }}
          >
            <AppIcon name="shuffle" size={22} color={shuffleColor} />
          </Pressable>
          <Pressable
            style={styles.infoBtn}
            onPress={handleRepeat}
            hitSlop={4}
            accessibilityLabel="Repeat"
            accessibilityState={{ selected: repeat !== 'off' }}
          >
            <AppIcon
              name={repeat === 'track' ? 'repeatOne' : 'repeat'}
              size={22}
              color={repeatColor}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.progressRow}>
        <Text style={styles.timeText}>{formatTime(shownPosition)}</Text>
        <SeekSlider
          style={styles.slider}
          value={position}
          max={duration}
          onScrub={setScrub}
          onSeek={seek}
        />
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      <View style={styles.mainControls}>
        <Pressable style={styles.iconBtn} onPress={previous} hitSlop={8}>
          <AppIcon name="prev" size={32} color={colors.text} />
        </Pressable>
        <Pressable style={styles.playBtn} onPress={togglePlayPause} hitSlop={8}>
          <AppIcon name={isPlaying ? 'pause' : 'play'} size={36} color={colors.text} />
        </Pressable>
        <Pressable style={styles.iconBtn} onPress={next} hitSlop={8}>
          <AppIcon name="next" size={32} color={colors.text} />
        </Pressable>
      </View>

      <Pressable
        style={styles.queueBtn}
        onPress={handleQueue}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityState={{ expanded: panel === 'queue' }}
      >
        <Text style={[styles.queueText, panel === 'queue' && styles.queueTextActive]}>
          Your Queue
        </Text>
      </Pressable>

      <SongActionSheet
        song={sheetSong}
        onClose={() => setSheetSong(null)}
        onAddToPlaylist={() => setAddToPlaylistSong(sheetSong)}
      />
      <AddToPlaylistSheet song={addToPlaylistSong} onClose={() => setAddToPlaylistSong(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: screenPadding,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: ICON_BTN_SIZE,
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  artworkSlot: {
    marginBottom: spacing.lg,
  },
  panel: {
    flex: 1,
  },
  panelBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.xxs,
  },
  closeBtn: {
    width: CLOSE_BTN_SIZE,
    height: CLOSE_BTN_SIZE,
    borderRadius: CLOSE_BTN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHigh,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  infoSide: {
    width: INFO_BTN_SIZE * 2,
    flexDirection: 'row',
  },
  infoSideEnd: {
    justifyContent: 'flex-end',
  },
  infoBtn: {
    width: INFO_BTN_SIZE,
    height: INFO_BTN_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
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
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  slider: {
    flex: 1,
  },
  timeText: {
    ...typography.caption,
    color: colors.textTertiary,
    minWidth: 36,
    textAlign: 'center',
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginBottom: spacing.lg,
  },
  playBtn: {
    width: PLAY_BTN_SIZE,
    height: PLAY_BTN_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueBtn: {
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  queueText: {
    ...typography.bodyStrong,
    color: colors.textSecondary,
  },
  queueTextActive: {
    color: colors.accent,
  },
});
