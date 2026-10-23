import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AddToPlaylistSheet } from '@/components/AddToPlaylistSheet';
import { AppIcon } from '@/components/app-icon';
import { LazyList } from '@/components/native/LazyList';
import { SongActionSheet } from '@/components/SongActionSheet';
import { SONG_ROW_HEIGHT, SongRow } from '@/components/SongRow';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingState } from '@/components/states/LoadingState';
import { useArtistSongs } from '@/hooks/queries';
import { useMiniPlayerInset } from '@/hooks/useMiniPlayerPlacement';
import { playSongs, useCurrentSongId } from '@/hooks/usePlayer';
import { colors, radii, screenPadding, spacing, typography } from '@/theme';
import type { Song } from '@/types';

/** Every song by an artist, most popular first, loaded page by page as you scroll. */
export default function ArtistSongsScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const miniPlayerInset = useMiniPlayerInset();
  const currentSongId = useCurrentSongId();

  const {
    data: songs,
    isError,
    isFetching,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useArtistSongs(id);
  const [menuSong, setMenuSong] = useState<Song | null>(null);
  const [addingSong, setAddingSong] = useState<Song | null>(null);

  // A failed page waits for Try again instead of retrying on every scroll to the end.
  const loadMore = () => {
    if (hasNextPage && !isFetching && !isFetchNextPageError) void fetchNextPage();
  };

  const title = <Stack.Screen options={{ title: name || 'Songs' }} />;

  if (!songs?.length) {
    return (
      <>
        {title}
        {songs ? (
          <EmptyState icon="artist" title="No songs yet" />
        ) : isError && !isFetching ? (
          <ErrorState
            message="Could not load songs. Please try again."
            onRetry={() => void refetch()}
          />
        ) : (
          <LoadingState message="Loading songs…" />
        )}
      </>
    );
  }

  const handleShuffle = () => {
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    void playSongs(shuffled, 0);
  };

  return (
    <>
      {title}
      <LazyList
        data={songs}
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
              onPress={() => void playSongs(songs, 0)}
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
          isFetchingNextPage ? (
            <View style={styles.footer}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : isFetchNextPageError ? (
            <Pressable
              onPress={() => void fetchNextPage()}
              style={({ pressed }) => [styles.footer, pressed && styles.pressed]}
              accessibilityRole="button"
            >
              <Text style={styles.footerText}>Couldn&apos;t load more songs</Text>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          ) : undefined
        }
        renderItem={({ item, index }) => (
          <SongRow
            song={item}
            onPress={() => void playSongs(songs, index)}
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
