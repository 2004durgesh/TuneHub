import { useEffect, useState } from 'react';
import {
  appVersion,
  getLatestRelease,
  isNewerVersion,
  isSkippedRelease,
  type Release,
  syncOtaUpdate,
} from '@/services/ota';
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

/** The latest GitHub release when it's newer than the installed app and wasn't skipped. */
export function useNewRelease() {
  const [release, setRelease] = useState<Release | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      getLatestRelease()
        .then((latest) => {
          if (cancelled || !latest || isSkippedRelease(latest.version)) return;
          if (isNewerVersion(latest.version, appVersion)) setRelease(latest);
        })
        .catch(() => {});
    }, START_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return release;
}
