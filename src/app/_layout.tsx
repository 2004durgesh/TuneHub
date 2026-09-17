import { DarkTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { usePlayerBridge } from '@/hooks/usePlayer';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  usePlayerBridge();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DarkTheme}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="player" options={{ presentation: 'modal' }} />
          <Stack.Screen name="lyrics" options={{ presentation: 'modal' }} />
          <Stack.Screen name="queue" options={{ presentation: 'modal' }} />
          <Stack.Screen
            name="album/[id]"
            options={{ headerShown: true, headerTransparent: true, headerTintColor: colors.text }}
          />
          <Stack.Screen
            name="artist/[id]"
            options={{ headerShown: true, headerTransparent: true, headerTintColor: colors.text }}
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
          <Stack.Screen name="settings/index" />
          <Stack.Screen name="settings/playback" options={{ headerShown: true }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
