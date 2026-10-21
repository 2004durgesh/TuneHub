import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/app-icon';
import { Artwork } from '@/components/Artwork';
import { DownloadAllButton } from '@/components/DownloadAllButton';
import { SONG_ROW_HEIGHT, SongRow } from '@/components/SongRow';
import { LazyList } from '@/components/native/LazyList';
import { ErrorState } from '@/components/states/ErrorState';
import { useMiniPlayerInset } from '@/hooks/useMiniPlayerPlacement';
import { playSongs, useCurrentSongId } from '@/hooks/usePlayer';
import { getPlaylist, removeSongFromPlaylist, renamePlaylist } from '@/services/player/playerQueue';
import { trackToSong } from '@/services/player/trackAdapter';
import { colors, spacing, typography } from '@/theme';
import type { Song } from '@/types';

import type { Playlist } from 'react-native-nitro-player';

export default function PlaylistDetailScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const { top } = useSafeAreaInsets();
  const miniPlayerInset = useMiniPlayerInset();
  const currentSongId = useCurrentSongId();

  // A synchronous native read, so it happens during render instead of in an effect.
  const [loaded, setLoaded] = useState<{ id: string; playlist: Playlist | null }>(() => ({
    id,
    playlist: getPlaylist(id),
  }));
  if (loaded.id !== id) setLoaded({ id, playlist: getPlaylist(id) });
  const playlist = loaded.playlist;
  const load = () => setLoaded({ id, playlist: getPlaylist(id) });

  const songs: Song[] = playlist?.tracks.map(trackToSong) ?? [];

  const handleSongPress = (song: Song, index: number) => {
    void playSongs(songs, index);
  };

  const handleRemove = (song: Song) => {
    Alert.alert('Remove song', `Remove "${song.title}" from playlist?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await removeSongFromPlaylist(id, song.id);
          load();
        },
      },
    ]);
  };

  const handleRename = () => {
    Alert.prompt(
      'Rename playlist',
      'Enter new name',
      async (newName) => {
        if (newName?.trim()) {
          await renamePlaylist(id, newName.trim());
          load();
        }
      },
      'plain-text',
      playlist?.name ?? '',
    );
  };

  if (!playlist) return <ErrorState message="Playlist not found" onRetry={load} />;

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerTransparent: true,
          headerBackTitle: '',
          headerRight: () => (
            <Pressable onPress={handleRename} hitSlop={8}>
              <AppIcon name="more" size={22} color={colors.text} />
            </Pressable>
          ),
        }}
      />
      <LazyList
        data={songs}
        estimatedItemSize={SONG_ROW_HEIGHT}
        keyExtractor={(s) => s.id}
        bottomInset={spacing.xxl + miniPlayerInset}
        header={
          <View style={[styles.hero, { paddingTop: top + 56 }]}>
            <Artwork uri={playlist.artwork ?? songs[0]?.artworkUrl ?? ''} size={200} />
            <Text style={styles.title}>{playlist.name}</Text>
            <Text style={styles.count}>{songs.length} songs</Text>
            {songs.length > 0 && (
              <View style={styles.actions}>
                <Pressable style={styles.playBtn} onPress={() => void playSongs(songs, 0)}>
                  <AppIcon name="play" size={18} color={colors.onAccent} />
                  <Text style={styles.playBtnText}>Play All</Text>
                </Pressable>
                <DownloadAllButton
                  collection={{
                    id: `library:${playlist.id}`,
                    kind: 'playlist',
                    title: playlist.name,
                    artworkUrl: playlist.artwork ?? songs[0]?.artworkUrl ?? '',
                  }}
                  songs={songs}
                  style={styles.downloadBtn}
                />
              </View>
            )}
          </View>
        }
        renderItem={({ item, index }) => (
          <SongRow
            song={item}
            onPress={() => handleSongPress(item, index)}
            onLongPress={() => handleRemove(item)}
            isPlaying={currentSongId === item.id}
            rightElement={
              <Pressable onPress={() => handleRemove(item)} hitSlop={8}>
                <AppIcon name="trash" size={18} color={colors.textTertiary} />
              </Pressable>
            }
          />
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  title: { ...typography.sectionHeader, color: colors.text, textAlign: 'center' },
  count: { ...typography.metadata, color: colors.textSecondary },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 24,
  },
  downloadBtn: { borderRadius: 24 },
  playBtnText: { ...typography.bodyStrong, color: colors.onAccent },
});
