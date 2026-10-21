import { useSegments } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePlayerStore } from '@/store/playerStore';

export const MINI_PLAYER_HEIGHT = 64;
const GAP = 6;
// No JS API for the native tab-bar height in NativeTabs, so estimate it: iOS UITabBar ~49pt,
// Android Material 3 NavigationBar ~80dp. The safe-area bottom inset is added on top.
const TAB_BAR_HEIGHT = Platform.select({ ios: 49, android: 80, default: 56 }) ?? 56;

type Placement = { bottom: number; inTabs: boolean };

/** Where the collapsed MiniPlayer floats on the current route (distance from the bottom). */
export function useMiniPlayerPlacement(): Placement {
  const [first] = useSegments();
  const { bottom: safeBottom } = useSafeAreaInsets();
  const inTabs = first === '(tabs)';
  return { bottom: (inTabs ? TAB_BAR_HEIGHT : 0) + safeBottom + GAP, inTabs };
}

/**
 * Extra bottom padding a scrolling screen needs so its last rows can scroll clear of the
 * MiniPlayer. 0 when nothing is playing. Tab screens pass `inTabs`: a screen never moves between
 * the tabs and the stack, and reading the current route would re-render every mounted screen on
 * each navigation.
 */
export function useMiniPlayerInset(inTabs = false): number {
  const { bottom: safeBottom } = useSafeAreaInsets();
  const hasSong = usePlayerStore((s) => s.currentSong !== null);
  if (!hasSong) return 0;
  // Tab screens already end above the tab bar; pushed screens run to the screen edge.
  return (inTabs ? 0 : safeBottom) + GAP + MINI_PLAYER_HEIGHT;
}
