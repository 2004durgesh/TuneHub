import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Host } from '@expo/ui';
import { AppIcon, type IconName } from '@/components/app-icon';
import { ThemedList, ThemedListItem } from '@/components/native/ThemedList';
import { useHasActiveDownloads } from '@/hooks/useDownloads';
import {
  appVersion,
  buildNumber,
  getDownloadedOtaVersion,
  getLatestRelease,
  isNewerVersion,
  REPO_URL,
  restartApp,
  runningOtaVersion,
  type Release,
} from '@/services/ota';
import { useOtaStore } from '@/store';
import { colors } from '@/theme';

type ReleaseCheck =
  { state: 'idle' | 'checking' | 'error' } | { state: 'done'; release: Release | null };

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const otaStatus = useOtaStore((s) => s.status);
  const otaPercent = useOtaStore((s) => s.percent);
  const hasActiveDownloads = useHasActiveDownloads();
  const [check, setCheck] = useState<ReleaseCheck>({ state: 'idle' });

  const downloadedOta = getDownloadedOtaVersion();
  const pendingOta = downloadedOta && downloadedOta !== runningOtaVersion ? downloadedOta : null;
  const newerRelease =
    check.state === 'done' && check.release && isNewerVersion(check.release.version, appVersion)
      ? check.release
      : null;

  async function handleCheck() {
    if (newerRelease) {
      void Linking.openURL(newerRelease.url);
      return;
    }
    setCheck({ state: 'checking' });
    try {
      setCheck({ state: 'done', release: await getLatestRelease() });
    } catch {
      setCheck({ state: 'error' });
    }
  }

  const checkText =
    check.state === 'checking'
      ? 'Checking…'
      : check.state === 'error'
        ? "Couldn't reach GitHub"
        : check.state === 'done'
          ? newerRelease
            ? `v${newerRelease.version} available · tap to open`
            : 'Up to date'
          : 'Look for a newer app release';

  const icon = (name: IconName) => <AppIcon name={name} size={20} color={colors.accent} />;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'About',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
        <Host style={styles.listHost} colorScheme="dark">
          <ThemedList>
            <ThemedListItem
              leading={icon('info')}
              supportingText={buildNumber ? `${appVersion} (${buildNumber})` : appVersion}
            >
              Version
            </ThemedListItem>
            <ThemedListItem
              leading={icon('code')}
              supportingText={__DEV__ ? 'Metro' : (runningOtaVersion ?? 'Built-in')}
            >
              JavaScript Bundle
            </ThemedListItem>
            {otaStatus === 'downloading' && (
              <ThemedListItem leading={icon('update')} supportingText={`${otaPercent ?? 0}%`}>
                Downloading Update
              </ThemedListItem>
            )}
            {pendingOta && otaStatus !== 'downloading' && (
              <ThemedListItem
                leading={icon('update')}
                onPress={hasActiveDownloads ? undefined : restartApp}
                supportingText={`${pendingOta} · ${
                  hasActiveDownloads ? 'restart once downloads finish' : 'tap to restart'
                }`}
              >
                Update Ready
              </ThemedListItem>
            )}
            <ThemedListItem
              leading={icon('download')}
              onPress={check.state === 'checking' ? undefined : handleCheck}
              supportingText={checkText}
            >
              Check for Updates
            </ThemedListItem>
            <ThemedListItem
              leading={icon('share')}
              onPress={() => void Linking.openURL(REPO_URL)}
              supportingText={REPO_URL.replace('https://', '')}
            >
              Source Code
            </ThemedListItem>
          </ThemedList>
        </Host>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listHost: {
    flex: 1,
  },
});
