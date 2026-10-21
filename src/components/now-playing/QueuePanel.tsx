import Animated from 'react-native-reanimated';

import { EdgeFadeItem, useEdgeFade } from '@/components/EdgeFade';
import { SONG_LIST_WINDOW, SongRow, songRowLayout } from '@/components/SongRow';
import { EmptyState } from '@/components/states/EmptyState';
import { playSongs, useCurrentSongId } from '@/hooks/usePlayer';
import { useQueue } from '@/services/player';

/** The live queue, shown in place of the artwork in the expanded player. */
export function QueuePanel() {
  const { queue } = useQueue();
  const currentSongId = useCurrentSongId();
  const fade = useEdgeFade();

  if (queue.length === 0) {
    return (
      <EmptyState icon="queue" title="Queue is empty" subtitle="Play a song to build your queue" />
    );
  }

  return (
    <Animated.FlatList
      {...fade.scrollProps}
      {...SONG_LIST_WINDOW}
      getItemLayout={songRowLayout}
      data={queue}
      keyExtractor={(s, i) => `${s.id}-${i}`}
      showsVerticalScrollIndicator={false}
      renderItem={({ item, index }) => (
        <EdgeFadeItem frame={fade.frame} index={index}>
          <SongRow
            song={item}
            onPress={() => void playSongs(queue, index)}
            isPlaying={currentSongId === item.id}
          />
        </EdgeFadeItem>
      )}
    />
  );
}
