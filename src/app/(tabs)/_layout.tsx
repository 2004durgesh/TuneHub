import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppTabs from '@/components/app-tabs';
import MiniPlayer from '@/components/MiniPlayer';

// Approximate native tab-bar content heights (dp) — the MiniPlayer floats just
// above the bar. There is no JS API for the native tab-bar height in
// expo-router NativeTabs / react-native-screens, so we estimate: iOS UITabBar
// is ~49pt, Android Material 3 NavigationBar is ~80dp. The safe-area bottom
// inset (gesture bar) is added on top. BottomAccessory only renders on iOS 26+
// in the installed expo-router, so this cross-platform overlay is used instead.
const TAB_BAR_HEIGHT = Platform.select({ ios: 49, android: 80, default: 56 }) ?? 56;
const GAP = 6;

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottom = TAB_BAR_HEIGHT + insets.bottom + GAP;

  return (
    <View style={styles.root}>
      <AppTabs />
      <MiniPlayer style={[styles.miniPlayer, { bottom }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  miniPlayer: {
    position: 'absolute',
    left: 8,
    right: 8,
  },
});
