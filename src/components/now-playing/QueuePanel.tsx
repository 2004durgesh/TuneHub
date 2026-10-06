import { FlatList } from 'react-native';

import { SongRow } from '@/components/SongRow';
import { EmptyState } from '@/components/states/EmptyState';
import { usePlayer } from '@/hooks/usePlayer';
import { useQueue } from '@/services/player';

/** The live queue, shown in place of the artwork in the expanded player. */
export function QueuePanel() {
  const { queue } = useQueue();
  const { currentSong, playSongs } = usePlayer();

  if (queue.length === 0) {
    return (
      <EmptyState icon="queue" title="Queue is empty" subtitle="Play a song to build your queue" />
    );
  }

  return (
    <FlatList
      data={queue}
      keyExtractor={(s, i) => `${s.id}-${i}`}
      showsVerticalScrollIndicator={false}
      renderItem={({ item, index }) => (
        <SongRow
          song={item}
          onPress={() => void playSongs(queue, index)}
          isPlaying={currentSong?.id === item.id}
        />
      )}
    />
  );
}
