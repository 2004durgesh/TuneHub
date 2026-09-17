import { Color } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Platform, useColorScheme } from 'react-native';

import { colors } from '@/theme';

// Platform-native tab bar background: iOS uses UIKit systemBackground (auto dark/light),
// Android uses Material You dynamic surface (requires useColorScheme for React Compiler compat).
const tabBarBg = Platform.select({
  ios: Color.ios.systemBackground,
  android: Color.android.dynamic.surface,
  default: colors.background,
});

export default function AppTabs() {
  useColorScheme(); // keeps Color.android.dynamic.* fresh under React Compiler memoization

  return (
    <NativeTabs backgroundColor={tabBarBg} labelStyle={{ selected: { color: colors.accent } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          md={{ default: 'home', selected: 'home' }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search">
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="library">
        <NativeTabs.Trigger.Label>Library</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'books.vertical', selected: 'books.vertical.fill' }}
          md={{ default: 'library_music', selected: 'library_music' }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
