import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/app-icon';
import { Artwork } from '@/components/Artwork';
import { DownloadAllButton } from '@/components/DownloadAllButton';
import { SongRow } from '@/components/SongRow';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingState } from '@/components/states/LoadingState';
import { useMiniPlayerInset } from '@/hooks/useMiniPlayerPlacement';
import { usePlayer } from '@/hooks/usePlayer';
import { getAlbum } from '@/services/music/albumService';
import { useSettingsStore } from '@/store/settingsStore';
import { colors, radii, screenPadding, spacing, typography } from '@/theme';
import type { Album, Song } from '@/types';

export default function AlbumScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { top } = useSafeAreaInsets();
  const miniPlayerInset = useMiniPlayerInset();
  const audioQuality = useSettingsStore((s) => s.audioQuality);
  const { playSongs, currentSong } = usePlayer();

  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlbum = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAlbum(id, audioQuality);
      setAlbum(data);
    } catch {
      setError('Could not load album. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id, audioQuality]);

  useEffect(() => {
    void fetchAlbum();
  }, [fetchAlbum]);

  const handleSongPress = useCallback(
    (song: Song) => {
      if (!album) return;
      const index = album.songs.findIndex((s) => s.id === song.id);
      void playSongs(album.songs, Math.max(index, 0));
    },
    [album, playSongs],
  );

  const handlePlayAll = useCallback(() => {
    if (album?.songs.length) {
      void playSongs(album.songs, 0);
    }
  }, [album, playSongs]);

  const handleShuffleAll = useCallback(() => {
    if (album?.songs.length) {
      const shuffled = [...album.songs].sort(() => Math.random() - 0.5);
      void playSongs(shuffled, 0);
    }
  }, [album, playSongs]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: '', headerTransparent: true, headerBackTitle: '' }} />
        <LoadingState message="Loading album…" />
      </>
    );
  }

  if (error || !album) {
    return (
      <>
        <Stack.Screen options={{ title: '', headerTransparent: true, headerBackTitle: '' }} />
        <ErrorState message={error ?? 'Album not found'} onRetry={fetchAlbum} />
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
      <FlatList
        data={album.songs}
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
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
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
