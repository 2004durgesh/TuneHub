import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { useMiniPlayerInset } from '@/hooks/useMiniPlayerPlacement';
import { playSongs, useCurrentSongId } from '@/hooks/usePlayer';
import { getPlaylist } from '@/services/music/playlistService';
import { useSettingsStore } from '@/store/settingsStore';
import { colors, radii, screenPadding, spacing, typography } from '@/theme';
import type { RemotePlaylist, Song } from '@/types';

export default function PlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { top } = useSafeAreaInsets();
  const miniPlayerInset = useMiniPlayerInset();
  const audioQuality = useSettingsStore((s) => s.audioQuality);
  const currentSongId = useCurrentSongId();

  const [playlist, setPlaylist] = useState<RemotePlaylist | null>(null);
  const [menuSong, setMenuSong] = useState<Song | null>(null);
  const [adding, setAdding] = useState<{ songs: readonly Song[]; name?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getPlaylist(id, 1, 50, audioQuality).then(
      (data) => {
        if (cancelled) return;
        setPlaylist(data);
        setError(null);
        setLoading(false);
      },
      () => {
        if (cancelled) return;
        setError('Could not load playlist. Please try again.');
        setLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [id, audioQuality, attempt]);

  const retry = () => {
    setLoading(true);
    setError(null);
    setAttempt((n) => n + 1);
  };

  const handleSongPress = (song: Song) => {
    if (!playlist?.songs.length) return;
    const index = playlist.songs.findIndex((s) => s.id === song.id);
    void playSongs(playlist.songs, Math.max(index, 0));
  };

  const handlePlayAll = () => {
    if (playlist?.songs.length) {
      void playSongs(playlist.songs, 0);
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: '', headerTransparent: true, headerBackTitle: '' }} />
        <LoadingState message="Loading playlist…" />
      </>
    );
  }

  if (error || !playlist) {
    return (
      <>
        <Stack.Screen options={{ title: '', headerTransparent: true, headerBackTitle: '' }} />
        <ErrorState message={error ?? 'Playlist not found'} onRetry={retry} />
      </>
    );
  }

  const songCountText =
    playlist.songCount != null
      ? `${playlist.songCount} song${playlist.songCount === 1 ? '' : 's'}`
      : `${playlist.songs.length} song${playlist.songs.length === 1 ? '' : 's'}`;

  return (
    <>
      <Stack.Screen options={{ title: '', headerTransparent: true, headerBackTitle: '' }} />
      <LazyList
        data={playlist.songs}
        estimatedItemSize={SONG_ROW_HEIGHT}
        keyExtractor={(song) => song.id}
        bottomInset={spacing.xxl + miniPlayerInset}
        header={
          <View style={[styles.header, { paddingTop: top + spacing.xl }]}>
            <View style={styles.artworkContainer}>
              <Artwork uri={playlist.artworkUrl} size={240} borderRadius={radii.artwork} />
            </View>
            <Text style={styles.playlistTitle} numberOfLines={2}>
              {playlist.title}
            </Text>
            {playlist.description != null && playlist.description.length > 0 && (
              <Text style={styles.description} numberOfLines={2}>
                {playlist.description}
              </Text>
            )}
            <Text style={styles.songCount}>{songCountText}</Text>
            <View style={styles.actionRow}>
              <Pressable
                style={({ pressed }) => [styles.playAllButton, pressed && styles.pressed]}
                onPress={handlePlayAll}
              >
                <AppIcon name="play" size={18} color={colors.onAccent} />
                <Text style={styles.playAllText}>Play All</Text>
              </Pressable>
              <OutlinedIconButton
                onPress={() => setAdding({ songs: playlist.songs, name: playlist.title })}
                accessibilityLabel="Add all to playlist"
              >
                <AppIcon name="playlistAdd" size={20} color={colors.accent} />
              </OutlinedIconButton>
              <DownloadAllButton
                collection={{
                  id: `playlist:${playlist.id}`,
                  kind: 'playlist',
                  title: playlist.title,
                  artworkUrl: playlist.artworkUrl,
                }}
                songs={playlist.songs}
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
  playlistTitle: {
    ...typography.sectionHeader,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  songCount: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radii.sm,
  },
  playAllText: {
    ...typography.bodyStrong,
    color: colors.onAccent,
  },
  pressed: {
    opacity: 0.7,
  },
});
