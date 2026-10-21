import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useReducer, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AddToPlaylistSheet } from '@/components/AddToPlaylistSheet';
import { AppIcon } from '@/components/app-icon';
import { LazyList } from '@/components/native/LazyList';
import { SongActionSheet } from '@/components/SongActionSheet';
import { SONG_ROW_HEIGHT, SongRow } from '@/components/SongRow';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingState } from '@/components/states/LoadingState';
import { useMiniPlayerInset } from '@/hooks/useMiniPlayerPlacement';
import { playSongs, useCurrentSongId } from '@/hooks/usePlayer';
import { getArtistSongs } from '@/services/music/artistService';
import { useSettingsStore } from '@/store/settingsStore';
import { colors, radii, screenPadding, spacing, typography } from '@/theme';
import type { Song } from '@/types';

type Feed = { songs: Song[]; loading: boolean; done: boolean; failed: boolean };
type FeedAction = { type: 'loaded'; songs: Song[] } | { type: 'failed' } | { type: 'loadMore' };

// Pages can repeat songs, and an empty page (or one with only repeats) is the end.
function feedReducer(feed: Feed, action: FeedAction): Feed {
  switch (action.type) {
    case 'loaded': {
      const known = new Set(feed.songs.map((song) => song.id));
      const fresh = action.songs.filter((song) => !known.has(song.id));
      return {
        songs: fresh.length > 0 ? [...feed.songs, ...fresh] : feed.songs,
        loading: false,
        done: fresh.length === 0,
        failed: false,
      };
    }
    case 'failed':
      return { ...feed, loading: false, failed: true };
    case 'loadMore':
      return { ...feed, loading: true, failed: false };
  }
}

/** Every song by an artist, most popular first, loaded page by page as you scroll. */
export default function ArtistSongsScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const miniPlayerInset = useMiniPlayerInset();
  const audioQuality = useSettingsStore((s) => s.audioQuality);
  const currentSongId = useCurrentSongId();

  const [feed, dispatch] = useReducer(feedReducer, {
    songs: [],
    loading: true,
    done: false,
    failed: false,
  });
  const [page, setPage] = useState(0);
  // Bumped to refetch the same page after a failure.
  const [attempt, setAttempt] = useState(0);
  const [menuSong, setMenuSong] = useState<Song | null>(null);
  const [addingSong, setAddingSong] = useState<Song | null>(null);

  useEffect(() => {
    let cancelled = false;
    getArtistSongs(id, page, audioQuality).then(
      (songs) => {
        if (!cancelled) dispatch({ type: 'loaded', songs });
      },
      () => {
        if (!cancelled) dispatch({ type: 'failed' });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [id, page, audioQuality, attempt]);

  const loadMore = () => {
    if (feed.loading || feed.done || feed.failed) return;
    dispatch({ type: 'loadMore' });
    setPage((p) => p + 1);
  };

  const retry = () => {
    dispatch({ type: 'loadMore' });
    setAttempt((n) => n + 1);
  };

  const handleShuffle = () => {
    const shuffled = [...feed.songs].sort(() => Math.random() - 0.5);
    void playSongs(shuffled, 0);
  };

  const title = <Stack.Screen options={{ title: name || 'Songs' }} />;

  if (feed.songs.length === 0) {
    return (
      <>
        {title}
        {feed.loading ? (
          <LoadingState message="Loading songs…" />
        ) : feed.failed ? (
          <ErrorState message="Could not load songs. Please try again." onRetry={retry} />
        ) : (
          <EmptyState icon="artist" title="No songs yet" />
        )}
      </>
    );
  }

  return (
    <>
      {title}
      <LazyList
        data={feed.songs}
        estimatedItemSize={SONG_ROW_HEIGHT}
        keyExtractor={(song) => song.id}
        bottomInset={spacing.xxl + miniPlayerInset}
        onEndReached={loadMore}
        header={
          <View style={styles.actionRow}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.playButton,
                pressed && styles.pressed,
              ]}
              onPress={() => void playSongs(feed.songs, 0)}
            >
              <AppIcon name="play" size={18} color={colors.onAccent} />
              <Text style={styles.playButtonText}>Play All</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.shuffleButton,
                pressed && styles.pressed,
              ]}
              onPress={handleShuffle}
            >
              <AppIcon name="shuffle" size={18} color={colors.accent} />
              <Text style={styles.shuffleButtonText}>Shuffle</Text>
            </Pressable>
          </View>
        }
        footer={
          feed.failed ? (
            <Pressable
              onPress={retry}
              style={({ pressed }) => [styles.footer, pressed && styles.pressed]}
              accessibilityRole="button"
            >
              <Text style={styles.footerText}>Couldn&apos;t load more songs</Text>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          ) : feed.loading ? (
            <View style={styles.footer}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : undefined
        }
        renderItem={({ item, index }) => (
          <SongRow
            song={item}
            onPress={() => void playSongs(feed.songs, index)}
            onLongPress={setMenuSong}
            isPlaying={currentSongId === item.id}
          />
        )}
      />
      <SongActionSheet
        song={menuSong}
        onClose={() => setMenuSong(null)}
        onAddToPlaylist={() => setAddingSong(menuSong)}
      />
      <AddToPlaylistSheet songs={addingSong && [addingSong]} onClose={() => setAddingSong(null)} />
    </>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
  },
  playButton: {
    backgroundColor: colors.accent,
  },
  shuffleButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  playButtonText: {
    ...typography.bodyStrong,
    color: colors.onAccent,
  },
  shuffleButtonText: {
    ...typography.bodyStrong,
    color: colors.accent,
  },
  pressed: {
    opacity: 0.7,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.lg,
  },
  footerText: {
    ...typography.metadata,
    color: colors.textSecondary,
  },
  retryText: {
    ...typography.bodyStrong,
    color: colors.accent,
  },
});
