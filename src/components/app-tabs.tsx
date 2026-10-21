import { NativeTabs } from 'expo-router/native-tabs';
import { useColorScheme } from 'react-native';

import { colors } from '@/theme';

export default function AppTabs() {
  useColorScheme(); // keeps Color.android.dynamic.* fresh under React Compiler memoization

  return (
    <NativeTabs
      backgroundColor={colors.surface}
      tintColor={colors.accent}
      labelStyle={{ selected: { color: colors.accent } }}
      activityEnabled
    >
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
