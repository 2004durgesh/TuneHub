import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddToPlaylistSheet } from '@/components/AddToPlaylistSheet';
import { AppIcon } from '@/components/app-icon';
import { Artwork } from '@/components/Artwork';
import { DownloadAllButton } from '@/components/DownloadAllButton';
import { OutlinedIconButton } from '@/components/OutlinedIconButton';
import { SongActionSheet } from '@/components/SongActionSheet';
import { SONG_ROW_HEIGHT, SongRow } from '@/components/SongRow';
import { LazyList } from '@/components/native/LazyList';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingState } from '@/components/states/LoadingState';
import { useAlbum } from '@/hooks/queries';
import { useMiniPlayerInset } from '@/hooks/useMiniPlayerPlacement';
import { playSongs, useCurrentSongId } from '@/hooks/usePlayer';
import { colors, radii, screenPadding, spacing, typography } from '@/theme';
import type { Song } from '@/types';

export default function AlbumScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { top } = useSafeAreaInsets();
  const miniPlayerInset = useMiniPlayerInset();
  const currentSongId = useCurrentSongId();

  const albumQuery = useAlbum(id);
  const album = albumQuery.data;
  const [menuSong, setMenuSong] = useState<Song | null>(null);
  const [adding, setAdding] = useState<{ songs: readonly Song[]; name?: string } | null>(null);

  const handleSongPress = (song: Song) => {
    if (!album) return;
    const index = album.songs.findIndex((s) => s.id === song.id);
    void playSongs(album.songs, Math.max(index, 0));
  };

  const handlePlayAll = () => {
    if (album?.songs.length) {
      void playSongs(album.songs, 0);
    }
  };

  const handleShuffleAll = () => {
    if (album?.songs.length) {
      const shuffled = [...album.songs].sort(() => Math.random() - 0.5);
      void playSongs(shuffled, 0);
    }
  };

  if (!album) {
    return (
      <>
        <Stack.Screen options={{ title: '', headerTransparent: true, headerBackTitle: '' }} />
        {albumQuery.isError && !albumQuery.isFetching ? (
          <ErrorState
            message="Could not load album. Please try again."
            onRetry={() => void albumQuery.refetch()}
          />
        ) : (
          <LoadingState message="Loading album…" />
        )}
      </>
    );
  }

  const metaParts: string[] = [];
  if (album.year != null) metaParts.push(String(album.year));
  if (album.language) metaParts.push(album.language);
  const meta = metaParts.join(' · ');

  return (
    <>
      <Stack.Screen options={{ title: '', headerTransparent: true, headerBackTitle: '' }} />
      <LazyList
        data={album.songs}
        estimatedItemSize={SONG_ROW_HEIGHT}
        keyExtractor={(song) => song.id}
        bottomInset={spacing.xxl + miniPlayerInset}
        header={
          <View style={[styles.header, { paddingTop: top + spacing.xl }]}>
            <View style={styles.artworkContainer}>
              <Artwork uri={album.artworkUrl} size={280} borderRadius={radii.artwork} />
            </View>
            <Text style={styles.albumTitle} numberOfLines={2}>
              {album.title}
            </Text>
            <Text style={styles.artistName} numberOfLines={1}>
              {album.artistName}
            </Text>
            {meta ? <Text style={styles.meta}>{meta}</Text> : null}
            <View style={styles.actionRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.playButton,
                  pressed && styles.pressed,
                ]}
                onPress={handlePlayAll}
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
                onPress={handleShuffleAll}
              >
                <AppIcon name="shuffle" size={18} color={colors.accent} />
                <Text style={styles.shuffleButtonText}>Shuffle</Text>
              </Pressable>
              <OutlinedIconButton
                onPress={() => setAdding({ songs: album.songs, name: album.title })}
                accessibilityLabel="Add all to playlist"
              >
                <AppIcon name="playlistAdd" size={20} color={colors.accent} />
              </OutlinedIconButton>
              <DownloadAllButton
                collection={{
                  id: `album:${album.id}`,
                  kind: 'album',
                  title: album.title,
                  artworkUrl: album.artworkUrl,
                }}
                songs={album.songs}
              />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <SongRow
            song={item}
            onPress={handleSongPress}
            onLongPress={setMenuSong}
            isPlaying={currentSongId === item.id}
          />
        )}
      />
      <SongActionSheet
        song={menuSong}
        onClose={() => setMenuSong(null)}
        onAddToPlaylist={() => menuSong && setAdding({ songs: [menuSong] })}
      />
      <AddToPlaylistSheet
        songs={adding?.songs ?? null}
        suggestedName={adding?.name}
        onClose={() => setAdding(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingHorizontal: screenPadding,
    paddingBottom: spacing.lg,
  },
  artworkContainer: {
    marginBottom: spacing.lg,
  },
  albumTitle: {
    ...typography.sectionHeader,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xxs,
  },
  artistName: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxs,
  },
  meta: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  actionRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
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
});
