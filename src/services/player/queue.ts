import { useActualQueue } from 'react-native-nitro-player';
import type { Song } from '@/types';
import { trackToSong } from './trackAdapter';

/** The live playback queue as domain Songs. */
export function useQueue(): { queue: Song[]; refreshQueue: () => void; isLoading: boolean } {
  const { queue, refreshQueue, isLoading } = useActualQueue();
  return { queue: queue.map(trackToSong), refreshQueue, isLoading };
}
