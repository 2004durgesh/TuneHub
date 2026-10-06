import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState, useCallback } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '@/components/app-icon';
import { SongRow } from '@/components/SongRow';
import { SongActionSheet } from '@/components/SongActionSheet';
import { AddToPlaylistSheet } from '@/components/AddToPlaylistSheet';
import { EmptyState } from '@/components/states/EmptyState';
import { useHistory } from '@/hooks/useHistory';
import { usePlayer } from '@/hooks/usePlayer';
import { colors, spacing, typography } from '@/theme';
import type { Song } from '@/types';

export default function HistoryScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { history, clearHistory } = useHistory();
  const { playSongs } = usePlayer();
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [addToPlaylistSong, setAddToPlaylistSong] = useState<Song | null>(null);

  const handleClearPress = useCallback(() => {
    Alert.alert('Clear History', 'Remove all recently played songs?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearHistory },
    ]);
  }, [clearHistory]);

  const handleSongPress = useCallback(
    (song: Song) => {
      void playSongs([song], 0);
    },
    [playSongs],
  );

  const handleLongPress = useCallback((song: Song) => {
    setSelectedSong(song);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.headerSide}>
          <AppIcon name="chevronLeft" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Recently Played</Text>
        {history.length > 0 ? (
          <Pressable onPress={handleClearPress} hitSlop={8} style={styles.headerSide}>
            <AppIcon name="trash" size={20} color={colors.textSecondary} />
          </Pressable>
        ) : (
          <View style={styles.headerSide} />
        )}
      </View>

      {history.length === 0 ? (
        <EmptyState
          icon="queue"
          title="No history yet"
          subtitle="Songs you play will appear here"
        />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item }) => (
            <SongRow song={item} onPress={handleSongPress} onLongPress={handleLongPress} />
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
  listContent: {
    paddingBottom: spacing.xxl,
  },
});
