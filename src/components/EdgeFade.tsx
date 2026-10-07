import type { ReactNode } from 'react';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { spacing } from '@/theme';

const FADE = spacing.xxl;
const EDGE_OPACITY = 0.12;

export type EdgeFadeFrame = {
  scrollY: SharedValue<number>;
  viewport: SharedValue<number>;
  content: SharedValue<number>;
};

/**
 * Scroll tracking for an Animated.ScrollView / Animated.FlatList whose items fade into the
 * backdrop at its top and bottom edges. Spread `scrollProps` on the scroller, pass `frame` to
 * each `EdgeFadeItem`.
 */
export function useEdgeFade() {
  const scrollY = useSharedValue(0);
  const viewport = useSharedValue(0);
  const content = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.set(e.contentOffset.y);
  });
  return {
    frame: { scrollY, viewport, content },
    scrollProps: {
      onScroll,
      scrollEventThrottle: 16,
      onLayout: (e: LayoutChangeEvent) => viewport.set(e.nativeEvent.layout.height),
      onContentSizeChange: (_: number, height: number) => content.set(height),
    },
  };
}

type Props = {
  frame: EdgeFadeFrame;
  /** For uniform list rows: position is `index × row height` (FlatList cells wrap the item). */
  index?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/**
 * Dims toward an edge only while there's more content beyond it, so nothing is faded at rest.
 * Without `index` it must be a direct child of the scroll content.
 */
export function EdgeFadeItem({ frame, index, style, children }: Props) {
  const y = useSharedValue(0);
  const height = useSharedValue(0);
  const { scrollY, viewport, content } = frame;

  const fadeStyle = useAnimatedStyle(() => {
    const view = viewport.get();
    if (view === 0) return { opacity: 1 };
    const top = index === undefined ? y.get() : index * height.get();
    const center = top + height.get() / 2 - scrollY.get();
    const towardTop = interpolate(center, [0, FADE], [EDGE_OPACITY, 1], Extrapolation.CLAMP);
    const towardBottom = interpolate(
      view - center,
      [0, FADE],
      [EDGE_OPACITY, 1],
      Extrapolation.CLAMP,
    );
    const hiddenAbove = Math.min(1, Math.max(0, scrollY.get() / FADE));
    const hiddenBelow = Math.min(1, Math.max(0, (content.get() - view - scrollY.get()) / FADE));
    return {
      opacity: Math.min(1 - (1 - towardTop) * hiddenAbove, 1 - (1 - towardBottom) * hiddenBelow),
    };
  });

  return (
    <Animated.View
      style={[style, fadeStyle]}
      onLayout={(e) => {
        y.set(e.nativeEvent.layout.y);
        height.set(e.nativeEvent.layout.height);
      }}
    >
      {children}
    </Animated.View>
  );
}
