import { Platform } from 'react-native';
import type { TrackItem } from 'react-native-nitro-player';
import type { Song } from '@/types';
import { trackToSong } from './trackAdapter';

// `import type` above is erased at build time, so it never loads the native
// module on web. We resolve the real hook (or an empty fallback) ONCE at module
// load — the reference is stable, so calling it unconditionally in useQueue()
// respects the rules of hooks even though the module throws at import on web.
type NativeQueueHook = () => {
  queue: TrackItem[];
  refreshQueue: () => void;
  isLoading: boolean;
};

function useEmptyQueue(): ReturnType<NativeQueueHook> {
  return { queue: [], refreshQueue: () => {}, isLoading: false };
}

function resolveHook(): NativeQueueHook {
  if (Platform.OS === 'web') return useEmptyQueue;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('react-native-nitro-player').useActualQueue as NativeQueueHook;
  } catch {
    return useEmptyQueue;
  }
}

const useResolvedQueue: NativeQueueHook = resolveHook();

/** The live playback queue as domain Songs. Empty when audio is unavailable. */
export function useQueue(): { queue: Song[]; refreshQueue: () => void; isLoading: boolean } {
  const { queue, refreshQueue, isLoading } = useResolvedQueue();
  return { queue: queue.map(trackToSong), refreshQueue, isLoading };
}
