import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/app-icon';
import { Artwork } from '@/components/Artwork';
import { DownloadAllButton } from '@/components/DownloadAllButton';
import { SONG_LIST_WINDOW, SongRow } from '@/components/SongRow';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingState } from '@/components/states/LoadingState';
import { useMiniPlayerInset } from '@/hooks/useMiniPlayerPlacement';
import { usePlayer } from '@/hooks/usePlayer';
import { getPlaylist } from '@/services/music/playlistService';
import { useSettingsStore } from '@/store/settingsStore';
import { colors, radii, screenPadding, spacing, typography } from '@/theme';
import type { RemotePlaylist, Song } from '@/types';

export default function PlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { top } = useSafeAreaInsets();
  const miniPlayerInset = useMiniPlayerInset();
  const audioQuality = useSettingsStore((s) => s.audioQuality);
  const { playSongs, currentSong } = usePlayer();

  const [playlist, setPlaylist] = useState<RemotePlaylist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaylist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlaylist(id, 1, 50, audioQuality);
      setPlaylist(data);
    } catch {
      setError('Could not load playlist. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id, audioQuality]);

  useEffect(() => {
    void fetchPlaylist();
  }, [fetchPlaylist]);

  const handleSongPress = useCallback(
    (song: Song) => {
      if (!playlist?.songs.length) return;
      const index = playlist.songs.findIndex((s) => s.id === song.id);
      void playSongs(playlist.songs, Math.max(index, 0));
    },
    [playlist, playSongs],
  );

  const handlePlayAll = useCallback(() => {
    if (playlist?.songs.length) {
      void playSongs(playlist.songs, 0);
    }
  }, [playlist, playSongs]);

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
        <ErrorState message={error ?? 'Playlist not found'} onRetry={fetchPlaylist} />
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
      <FlatList
        data={playlist.songs}
        {...SONG_LIST_WINDOW}
        keyExtractor={(song) => song.id}
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: spacing.xxl + miniPlayerInset },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
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
          <SongRow song={item} onPress={handleSongPress} isPlaying={currentSong?.id === item.id} />
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
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
