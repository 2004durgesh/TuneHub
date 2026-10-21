import { DarkTheme, router, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, Pressable } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppIcon } from '@/components/app-icon';
import { NowPlaying } from '@/components/now-playing/NowPlaying';
import { Toast } from '@/components/Toast';
import { UpdateAvailableSheet } from '@/components/UpdateAvailableSheet';
import { UpdateToast } from '@/components/UpdateToast';
import { useDownloadsBridge } from '@/hooks/useDownloads';
import { useOtaUpdates } from '@/hooks/useOtaUpdates';
import { usePlayerBridge } from '@/hooks/usePlayer';
import { PerfTour, PerfWindows, perfScreenLayout } from '@/perf/perfHarness';
import { colors } from '@/theme';

// iOS keeps its native back button (chevron-only via headerBackButtonDisplayMode);
// Android's native one is an arrow, so swap in a chevron to match.
function androidBackButton({ canGoBack }: { canGoBack?: boolean }) {
  if (!canGoBack) return null;
  return (
    <Pressable
      onPress={() => router.back()}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Back"
    >
      <AppIcon name="chevronLeft" size={28} color={colors.text} />
    </Pressable>
  );
}

export default function RootLayout() {
  usePlayerBridge();
  useDownloadsBridge();
  useOtaUpdates();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DarkTheme}>
        <StatusBar style="light" />
        <Stack
          screenLayout={perfScreenLayout}
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            headerBackButtonDisplayMode: 'minimal',
            headerLeft: Platform.OS === 'android' ? androidBackButton : undefined,
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="album/[id]"
            options={{ headerShown: true, headerTransparent: true, headerTintColor: colors.text }}
          />
          <Stack.Screen
            name="artist/[id]"
            options={{ headerShown: true, headerTransparent: true, headerTintColor: colors.text }}
          />
          <Stack.Screen
            name="artist/[id]/songs"
            options={{
              headerShown: true,
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.text,
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="playlist/[id]"
            options={{ headerShown: true, headerTransparent: true, headerTintColor: colors.text }}
          />
          <Stack.Screen
            name="playlist-detail/[id]"
            options={{ headerShown: true, headerTransparent: true, headerTintColor: colors.text }}
          />
          <Stack.Screen name="liked-songs" />
          <Stack.Screen name="history" />
          <Stack.Screen name="playlists" />
          <Stack.Screen name="downloads" />
          <Stack.Screen
            name="settings/index"
            options={{
              headerShown: true,
              title: '',
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.text,
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen name="settings/playback" options={{ headerShown: true }} />
          <Stack.Screen name="settings/about" options={{ headerShown: true }} />
        </Stack>
        {/* Mini player and full player as one morphing surface above every screen. */}
        <NowPlaying />
        <Toast />
        <UpdateToast />
        <UpdateAvailableSheet />
        <PerfWindows />
        <PerfTour />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
