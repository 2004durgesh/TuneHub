import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/app-icon';
import { SongRow } from '@/components/SongRow';
import { EmptyState } from '@/components/states/EmptyState';
import { usePlayer } from '@/hooks/usePlayer';
import { useQueue } from '@/services/player';
import { colors, spacing, typography } from '@/theme';
import type { Song } from '@/types';
import { FlatList } from 'react-native';

export const unstable_settings = { initialRouteName: '(tabs)' };

export default function QueueScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { queue } = useQueue();
  const { currentSong, playSongs } = usePlayer();

  const handlePress = (song: Song, index: number) => {
    void playSongs(queue, index);
  };

  return (
    <View style={[styles.container, { paddingTop: top + spacing.sm }]}>
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()} hitSlop={8}>
          <AppIcon name="chevronDown" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Up Next</Text>
        <View style={styles.iconBtn} />
      </View>

      {queue.length === 0 ? (
        <EmptyState
          icon="queue"
          title="Queue is empty"
          subtitle="Play a song to build your queue"
        />
      ) : (
        <FlatList
          data={queue}
          keyExtractor={(s, i) => `${s.id}-${i}`}
          contentContainerStyle={{ paddingBottom: bottom + spacing.xxl }}
          renderItem={({ item, index }) => (
            <SongRow
              song={item}
              onPress={() => handlePress(item, index)}
              isPlaying={currentSong?.id === item.id}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  headerTitle: { ...typography.bodyStrong, color: colors.text },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
