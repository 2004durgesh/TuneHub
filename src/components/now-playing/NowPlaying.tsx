import { useNavigationContainerRef } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  FadeIn,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { ArtworkTransition } from '@/components/ArtworkTransition';
import { PlayerBackdrop } from '@/components/PlayerBackdrop';
import { useArtworkColors } from '@/hooks/useArtworkColors';
import { MINI_PLAYER_HEIGHT, useMiniPlayerPlacement } from '@/hooks/useMiniPlayerPlacement';
import { usePlayerStore, useSettingsStore } from '@/store';
import { colors, radii, spacing, springs, timings } from '@/theme';
import { FullPlayer, fullArtworkSize, fullArtworkTop, type Panel } from './FullPlayer';
import { MINI_ART_LEFT, MINI_ART_SIZE, MINI_ART_TOP, MiniBar } from './MiniBar';

const SIDE = spacing.xs;
const HAIRLINE = StyleSheet.hairlineWidth;
const SWIPE_VELOCITY = 600;
const LYRICS_OPEN_AT = 0.4;
const ART_SHRINK = 0.08;
const DRAG_PLAYER = 0;
const DRAG_LYRICS = 1;
const DRAG_PENDING = 2;
// Theme colors resolve to hex strings at runtime on every platform.
const MINI_BG = colors.surfaceElevated as string;
const FULL_BG = colors.background as string;

/**
 * The mini player and the full player as ONE surface. `progress` (0 = mini, 1 = full) morphs the
 * floating bar into a full-screen player: the container grows from the bar's frame to the screen,
 * the artwork canvas moves and scales from the thumbnail slot to the hero slot, the mini row fades
 * out and the full chrome and Skia backdrop are revealed. Tap or swipe up to expand; swipe down,
 * the chevron, Android back, or navigating away collapses.
 */
export function NowPlaying() {
  const hasSong = usePlayerStore((s) => s.currentSong !== null);
  // Unmounting without a song resets the expanded state for the next one.
  return hasSong ? <NowPlayingSurface /> : null;
}

function NowPlayingSurface() {
  const currentSong = usePlayerStore((s) => s.currentSong);
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);
  const dynamicAtmosphere = useSettingsStore((s) => s.dynamicAtmosphere);
  const palette = useArtworkColors(currentSong?.artworkUrl);
  const placement = useMiniPlayerPlacement();
  const { width: W, height: H } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const navigation = useNavigationContainerRef();

  // `open` mounts the full-player layers (they're heavy), `expanded` routes touches to them.
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  // Lyrics are mounted while a swipe up on the artwork reveals them, before `panel` commits.
  const [peek, setPeek] = useState(false);

  const progress = useSharedValue(0);
  const dragStart = useSharedValue(0);
  const offset = useSharedValue(placement.bottom);
  // 0 = artwork, 1 = lyrics/queue in the artwork's slot.
  const reveal = useSharedValue(0);
  const dragMode = useSharedValue(DRAG_PLAYER);

  const artSize = fullArtworkSize(W);
  const artTop = fullArtworkTop(insets.top);
  const miniWidth = W - SIDE * 2;
  const travel = H * 0.7;
  const revealTravel = artSize * 0.6;

  // Shared values use .get()/.set() (not .value) so React Compiler allows writes in callbacks.

  // Spring between the tab-bar and screen-edge positions on route changes.
  useEffect(() => {
    offset.set(reducedMotion ? placement.bottom : withSpring(placement.bottom, springs.smooth));
  }, [placement.bottom, reducedMotion, offset]);

  const openPanel = useCallback(
    (next: Exclude<Panel, null>) => {
      setPanel(next);
      reveal.set(reducedMotion ? 1 : withTiming(1, timings.base));
    },
    [reducedMotion, reveal],
  );

  const closePanel = useCallback(() => {
    if (reducedMotion) {
      reveal.set(0);
      setPanel(null);
      return;
    }
    reveal.set(
      withTiming(0, timings.base, (finished) => {
        if (finished) scheduleOnRN(setPanel, null);
      }),
    );
  }, [reducedMotion, reveal]);

  const commitLyrics = useCallback(() => {
    setPanel('lyrics');
    setPeek(false);
  }, []);

  const finishCollapse = useCallback(() => {
    setOpen(false);
    setPanel(null);
    setPeek(false);
    reveal.set(0);
  }, [reveal]);

  const animateTo = useCallback(
    (target: 0 | 1) => {
      setExpanded(target === 1);
      if (target === 1) setOpen(true);
      if (reducedMotion) {
        progress.set(target);
        if (target === 0) finishCollapse();
        return;
      }
      if (target === 0) reveal.set(withTiming(0, timings.base));
      progress.set(
        withSpring(target, springs.smooth, (finished) => {
          if (finished && target === 0) scheduleOnRN(finishCollapse);
        }),
      );
    },
    [reducedMotion, progress, reveal, finishCollapse],
  );

  // Navigating (e.g. "Go to Album" from the action sheet) collapses the player.
  useEffect(
    () =>
      navigation.addListener('state', () => {
        if (progress.get() > 0) animateTo(0);
      }),
    [navigation, animateTo, progress],
  );

  useEffect(() => {
    if (!expanded) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (panel) closePanel();
      else animateTo(0);
      return true;
    });
    return () => sub.remove();
  }, [expanded, panel, animateTo, closePanel]);

  // Drag tracks the finger; release springs to the nearest end, or the flick direction. In the
  // expanded player a swipe up that starts on the artwork reveals the lyrics instead.
  // Disabled while lyrics/queue are open so their lists scroll instead.
  const pan = Gesture.Pan()
    .enabled(panel === null)
    .activeOffsetY([-10, 10])
    .failOffsetX([-24, 24])
    .onStart((e) => {
      const onArtwork = e.absoluteY >= artTop && e.absoluteY <= artTop + artSize;
      if (progress.get() > 0.99 && onArtwork) {
        dragMode.set(DRAG_PENDING);
        return;
      }
      dragMode.set(DRAG_PLAYER);
      dragStart.set(progress.get());
      scheduleOnRN(setOpen, true);
    })
    .onUpdate((e) => {
      if (dragMode.get() === DRAG_PENDING && e.translationY !== 0) {
        if (e.translationY < 0) {
          dragMode.set(DRAG_LYRICS);
          scheduleOnRN(setPeek, true);
        } else {
          dragMode.set(DRAG_PLAYER);
          dragStart.set(progress.get());
        }
      }
      if (dragMode.get() === DRAG_LYRICS) {
        reveal.set(Math.min(1, Math.max(0, -e.translationY / revealTravel)));
      } else if (dragMode.get() === DRAG_PLAYER) {
        progress.set(Math.min(1, Math.max(0, dragStart.get() - e.translationY / travel)));
      }
    })
    .onEnd((e) => {
      if (dragMode.get() === DRAG_PENDING) return;
      if (dragMode.get() === DRAG_LYRICS) {
        const show =
          e.velocityY < -SWIPE_VELOCITY ||
          (e.velocityY < SWIPE_VELOCITY && reveal.get() > LYRICS_OPEN_AT);
        if (show) scheduleOnRN(commitLyrics);
        reveal.set(
          withSpring(
            show ? 1 : 0,
            { ...springs.smooth, velocity: -e.velocityY / revealTravel },
            (finished) => {
              if (finished && !show) scheduleOnRN(setPeek, false);
            },
          ),
        );
        return;
      }
      const target =
        e.velocityY < -SWIPE_VELOCITY
          ? 1
          : e.velocityY > SWIPE_VELOCITY
            ? 0
            : progress.get() > 0.5
              ? 1
              : 0;
      progress.set(
        withSpring(target, { ...springs.smooth, velocity: -e.velocityY / travel }, (finished) => {
          if (finished && target === 0) scheduleOnRN(finishCollapse);
        }),
      );
      scheduleOnRN(setExpanded, target === 1);
    });

  const containerStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const miniTop = H - offset.value - MINI_PLAYER_HEIGHT;
    return {
      top: interpolate(p, [0, 1], [miniTop, 0]),
      left: interpolate(p, [0, 1], [SIDE, 0]),
      width: interpolate(p, [0, 1], [miniWidth, W]),
      height: interpolate(p, [0, 1], [MINI_PLAYER_HEIGHT, H]),
      borderRadius: interpolate(p, [0, 1], [radii.card, 0]),
      borderWidth: interpolate(p, [0, 0.2], [HAIRLINE, 0], Extrapolation.CLAMP),
      backgroundColor: interpolateColor(p, [0, 1], [MINI_BG, FULL_BG]),
    };
  });

  // Full-screen layers live inside the growing container but are counter-translated so they stay
  // fixed on screen — the container's clip reveals them instead of re-laying them out each frame.
  const revealStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const miniTop = H - offset.value - MINI_PLAYER_HEIGHT;
    return {
      transform: [
        { translateX: -interpolate(p, [0, 1], [SIDE, 0]) },
        { translateY: -interpolate(p, [0, 1], [miniTop, 0]) },
      ],
    };
  });

  const miniStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.25], [1, 0], Extrapolation.CLAMP),
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.5], [0, 1], Extrapolation.CLAMP),
  }));
  const chromeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.6, 1], [0, 1], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(progress.value, [0, 1], [32, 0]) }],
  }));

  // The artwork is one full-size canvas, moved and scaled from the mini slot to the hero slot.
  // Revealing lyrics/queue lifts, shrinks and fades it out of its slot.
  const artStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const r = reveal.value;
    const miniTop = H - offset.value - MINI_PLAYER_HEIGHT;
    const base = interpolate(p, [0, 1], [MINI_ART_SIZE, artSize]);
    const size = base * (1 - r * ART_SHRINK);
    const inset = (base - size) / 2;
    const x = interpolate(p, [0, 1], [SIDE + MINI_ART_LEFT, (W - artSize) / 2]) + inset;
    const y = interpolate(p, [0, 1], [miniTop + MINI_ART_TOP, artTop]) + inset - r * spacing.lg;
    // RN scales around the center, so shift by half the shrinkage to pin the top-left corner.
    const shift = (artSize - size) / 2;
    return {
      opacity: 1 - r,
      transform: [{ translateX: x - shift }, { translateY: y - shift }, { scale: size / artSize }],
    };
  });
  // Keep the on-screen corner radius right at every scale (canvas units = visual / scale).
  const artRadius = useDerivedValue(() => {
    const p = progress.value;
    const size = interpolate(p, [0, 1], [MINI_ART_SIZE, artSize]);
    return interpolate(p, [0, 1], [radii.sm, radii.artwork]) * (artSize / size);
  });

  return (
    <Animated.View style={StyleSheet.absoluteFill} pointerEvents="box-none" entering={FadeIn}>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.container, containerStyle]}>
          {open && (
            <Animated.View
              style={[styles.fullLayer, { width: W, height: H }, revealStyle]}
              pointerEvents={expanded ? 'box-none' : 'none'}
            >
              {dynamicAtmosphere && (
                <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
                  <PlayerBackdrop palette={palette} animate={!reducedMotion} />
                </Animated.View>
              )}
              <Animated.View style={chromeStyle}>
                <FullPlayer
                  width={W}
                  height={H}
                  panel={panel}
                  content={panel ?? (peek ? 'lyrics' : null)}
                  reveal={reveal}
                  onOpenPanel={openPanel}
                  onClosePanel={closePanel}
                  onCollapse={() => animateTo(0)}
                />
              </Animated.View>
            </Animated.View>
          )}

          <Animated.View style={miniStyle} pointerEvents={expanded ? 'none' : 'auto'}>
            <MiniBar width={miniWidth} palette={palette} onExpand={() => animateTo(1)} />
          </Animated.View>
        </Animated.View>
      </GestureDetector>

      <Animated.View
        style={[styles.art, { width: artSize, height: artSize }, artStyle]}
        pointerEvents="none"
      >
        <ArtworkTransition
          uri={currentSong?.artworkUrl ?? ''}
          size={artSize}
          radius={artRadius}
          animate={!reducedMotion}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    overflow: 'hidden',
    borderColor: colors.border,
  },
  fullLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  art: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
