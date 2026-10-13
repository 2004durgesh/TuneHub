import { useEffect } from 'react';
import { syncOtaUpdate } from '@/services/ota';
import { useOtaStore } from '@/store';

// Leaves the first screen's requests and rendering alone; the update applies on a later launch.
const START_DELAY_MS = 3000;

export function useOtaUpdates() {
  useEffect(() => {
    if (__DEV__) return;
    const { setDownloading, setPercent, setReady, reset } = useOtaStore.getState();
    let dispose: (() => void) | undefined;
    const timer = setTimeout(() => {
      dispose = syncOtaUpdate({
        onDownloading: setDownloading,
        onProgress: setPercent,
        onReady: setReady,
        onFailed: reset,
      });
    }, START_DELAY_MS);
    return () => {
      clearTimeout(timer);
      dispose?.();
    };
  }, []);
}
