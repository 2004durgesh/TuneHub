import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState, useCallback } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '@/components/app-icon';
import { SongRow } from '@/components/SongRow';
import { SongActionSheet } from '@/components/SongActionSheet';
import { AddToPlaylistSheet } from '@/components/AddToPlaylistSheet';
import { EmptyState } from '@/components/states/EmptyState';
import { useLikedSongs } from '@/hooks/useLikedSongs';
import { usePlayer } from '@/hooks/usePlayer';
import { colors, spacing, typography } from '@/theme';
import type { Song } from '@/types';

export default function LikedSongsScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { likedSongs } = useLikedSongs();
  const { playSongs, currentSong, isPlaying } = usePlayer();
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [addToPlaylistSong, setAddToPlaylistSong] = useState<Song | null>(null);

  const handleSongPress = useCallback(
    (song: Song) => {
      const index = likedSongs.findIndex((s) => s.id === song.id);
      void playSongs(likedSongs, index >= 0 ? index : 0);
    },
    [likedSongs, playSongs],
  );

  const handleLongPress = useCallback((song: Song) => {
    setSelectedSong(song);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.headerSide}>
          <AppIcon name="chevronDown" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Liked Songs</Text>
        <View style={styles.headerSide} />
      </View>

      {likedSongs.length > 0 && (
        <Text style={styles.count}>
          {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}
        </Text>
      )}

      {likedSongs.length === 0 ? (
        <EmptyState icon="heart" title="No liked songs yet" subtitle="Like a song to see it here" />
      ) : (
        <FlatList
          data={likedSongs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SongRow
              song={item}
              onPress={handleSongPress}
              onLongPress={handleLongPress}
              isPlaying={currentSong?.id === item.id && isPlaying}
              rightElement={<AppIcon name="heartFill" size={20} color={colors.like} />}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <SongActionSheet
        song={selectedSong}
        onClose={() => setSelectedSong(null)}
        onAddToPlaylist={() => setAddToPlaylistSong(selectedSong)}
      />
      <AddToPlaylistSheet song={addToPlaylistSong} onClose={() => setAddToPlaylistSong(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerSide: {
    width: 40,
    alignItems: 'center',
  },
  title: {
    flex: 1,
    ...typography.sectionHeader,
    color: colors.text,
    textAlign: 'center',
  },
  count: {
    ...typography.metadata,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
});
