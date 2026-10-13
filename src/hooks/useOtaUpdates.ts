import { useEffect } from 'react';
import { syncOtaUpdate } from '@/services/ota';
import { useOtaStore } from '@/store';

export function useOtaUpdates() {
  useEffect(() => {
    if (__DEV__) return;
    const { setDownloading, setPercent, setReady, reset } = useOtaStore.getState();
    return syncOtaUpdate({
      onDownloading: setDownloading,
      onProgress: setPercent,
      onReady: setReady,
      onFailed: reset,
    });
  }, []);
}
