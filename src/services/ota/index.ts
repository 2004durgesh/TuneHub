import * as Application from 'expo-application';
import { Platform } from 'react-native';
import { getStoredOtaVersion, OTAUpdateManager, reloadApp } from 'react-native-nitro-ota';

const REPO = '2004durgesh/TuneHub';
export const REPO_URL = `https://github.com/${REPO}`;

export const appVersion = Application.nativeApplicationVersion ?? '0.0.0';
export const buildNumber = Application.nativeBuildVersion;

export const runningOtaVersion = getStoredOtaVersion();
export const getDownloadedOtaVersion = () => getStoredOtaVersion();
export const restartApp = () => reloadApp();

const releaseAsset = (name: string) => `${REPO_URL}/releases/download/v${appVersion}/${name}`;

type OtaHandlers = {
  onDownloading: () => void;
  onProgress: (percent: number) => void;
  onReady: () => void;
  onFailed: () => void;
};

export function syncOtaUpdate({ onDownloading, onProgress, onReady, onFailed }: OtaHandlers) {
  const manager = new OTAUpdateManager(
    releaseAsset(`ota-${Platform.OS}.zip`),
    releaseAsset(`ota-${Platform.OS}.json`),
  );
  manager.confirm();
  const unsubscribe = manager.onRollback((record) =>
    console.warn(
      `OTA: rolled back ${record.fromVersion} -> ${record.toVersion} (${record.reason})`,
    ),
  );

  let cancelled = false;
  void (async () => {
    try {
      const update = await manager.checkForUpdatesJS(appVersion);
      // nitro-ota reads GitHub's "Not Found" page (no OTA published yet) as a new version without metadata.
      if (cancelled || !update?.metadata || !update.hasUpdate || !update.isCompatible) return;
      onDownloading();
      let lastPercent = -1;
      await manager.downloadUpdate((received, total) => {
        if (total <= 0) return;
        const percent = Math.floor((received / total) * 100);
        if (percent === lastPercent) return;
        lastPercent = percent;
        onProgress(percent);
      });
      if (!cancelled) onReady();
    } catch (error) {
      onFailed();
      console.warn('OTA: update failed', error);
    }
  })();

  return () => {
    cancelled = true;
    unsubscribe();
  };
}

export type Release = { version: string; url: string };

export async function getLatestRelease(): Promise<Release | null> {
  const response = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GitHub responded ${response.status}`);
  const { tag_name, html_url } = (await response.json()) as { tag_name: string; html_url: string };
  return { version: tag_name.replace(/^v/, ''), url: html_url };
}

export function isNewerVersion(candidate: string, current: string): boolean {
  const parts = (version: string) => version.split('-')[0].split('.').map(Number);
  const a = parts(candidate);
  const b = parts(current);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff !== 0) return diff > 0;
  }
  return false;
}
