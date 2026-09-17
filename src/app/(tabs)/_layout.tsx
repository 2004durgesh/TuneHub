import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppTabs from '@/components/app-tabs';
import MiniPlayer from '@/components/MiniPlayer';

// Approximate native tab-bar heights — the MiniPlayer floats just above it.
// BottomAccessory only renders on iOS 26+ in the installed expo-router, so we
// render the MiniPlayer as a cross-platform overlay instead.
const TAB_BAR_HEIGHT = Platform.select({ ios: 49, android: 64, default: 56 }) ?? 56;

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottom = TAB_BAR_HEIGHT + (Platform.OS === 'ios' ? insets.bottom : 0);

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
