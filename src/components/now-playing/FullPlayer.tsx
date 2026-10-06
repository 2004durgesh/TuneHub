import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
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
const PANEL_TITLE = { lyrics: 'LYRICS', queue: 'UP NEXT' } as const;

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

type Props = {
  width: number;
  height: number;
  panel: Panel;
  onPanelChange: (panel: Panel) => void;
  onCollapse: () => void;
};

/** Expanded player chrome; the artwork and backdrop are drawn by NowPlaying. */
export function FullPlayer({ width, height, panel, onPanelChange, onCollapse }: Props) {
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
  const panelColor = (p: Exclude<Panel, null>) =>
    panel === p ? colors.accent : colors.textSecondary;

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

  const togglePanel = (p: Exclude<Panel, null>) => onPanelChange(panel === p ? null : p);

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
        {panel && (
          <Animated.View
            key={panel}
            style={styles.panel}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
          >
            {panel === 'lyrics' ? <LyricsPanel /> : <QueuePanel />}
          </Animated.View>
        )}
      </View>

      <View style={styles.infoRow}>
        <Pressable
          style={styles.iconBtn}
          onPress={() => currentSong && toggleLike(currentSong)}
          hitSlop={8}
        >
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
        <View style={styles.iconBtn} />
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

      <View style={styles.secondaryControls}>
        <Pressable style={styles.iconBtn} onPress={handleRepeat} hitSlop={8}>
          <AppIcon
            name={repeat === 'track' ? 'repeatOne' : 'repeat'}
            size={22}
            color={repeatColor}
          />
        </Pressable>
        <Pressable style={styles.iconBtn} onPress={() => togglePanel('lyrics')} hitSlop={8}>
          <AppIcon name="lyrics" size={22} color={panelColor('lyrics')} />
        </Pressable>
        <Pressable style={styles.iconBtn} onPress={() => togglePanel('queue')} hitSlop={8}>
          <AppIcon name="queue" size={22} color={panelColor('queue')} />
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
  secondaryControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },
});
