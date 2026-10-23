import {
  Profiler,
  useEffect,
  type ComponentType,
  type ProfilerOnRenderCallback,
  type ReactNode,
} from 'react';
import { router, type Href } from 'expo-router';

import { homeQueries } from '@/hooks/queries';
import { next, pause, play, playNow } from '@/services/player';
import { getAllPlaylists } from '@/services/player/playerQueue';
import { queryClient } from '@/services/query/client';
import { getHistory } from '@/services/storage/history';
import { usePlayerStore } from '@/store';

/**
 * Render measurements for TuneHub's screens and player, off unless Metro is started with
 * `EXPO_PUBLIC_PERF_RUN` set. Every `PerfProfiler` and every root route (`perfScreenLayout`) then
 * report to one accumulator, logged as `[perf]` lines (read them with `adb logcat -d | grep "\[perf\]"`):
 * - `npm run perf` (`screens`): `<PerfWindows />` logs whatever rendered in each 2 s window. Mark what
 *   you do with `adb shell log -t PERFMARK "<label>"` to line the windows up with it.
 * - `npm run perf:player` (`player`): `<PerfWindows />` starts the recently played songs and
 *   `<PerfRun />` plays a scripted session on the player instead.
 * - `npm run perf:tour` (`tour`): with the recently played songs playing, `<PerfTour />` opens
 *   almost every screen in turn and logs its first 5 s and the 3 s of idle after.
 *
 * Release builds have `__DEV__` false, so none of this runs there.
 */
const PERF_MODE = __DEV__ ? process.env.EXPO_PUBLIC_PERF_RUN : undefined;
export const PERF_RUN = PERF_MODE === 'screens' || PERF_MODE === 'player' || PERF_MODE === 'tour';
const WINDOW_MS = 2000;
const AUTOPLAY_DELAY_MS = 5000;
const TOUR_START_MS = 10000;
const TOUR_OPEN_MS = 5000;
const TOUR_IDLE_MS = 3000;
const TOUR_BACK_MS = 1000;

type PerfEntry = { commits: number; mounts: number; duration: number };
const entries: Record<string, PerfEntry> = {};

const onPerfRender: ProfilerOnRenderCallback = (id, phase, actualDuration) => {
  const entry = (entries[id] ??= { commits: 0, mounts: 0, duration: 0 });
  entry.commits += 1;
  if (phase === 'mount') entry.mounts += 1;
  entry.duration += actualDuration;
};

function resetPerf() {
  for (const id of Object.keys(entries)) delete entries[id];
}

function perfReport(label: string) {
  const rows = Object.entries(entries)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, e]) => `${id}: commits=${e.commits} mounts=${e.mounts} ms=${e.duration.toFixed(1)}`);
  console.log(`[perf] ${label} | ${rows.join(' | ')}`);
}

/** A `<Profiler>` for TuneHub's screens and components, active only during a perf run. */
export function PerfProfiler({ id, children }: { id: string; children: ReactNode }) {
  if (!PERF_RUN) return <>{children}</>;
  return (
    <Profiler id={id} onRender={onPerfRender}>
      {children}
    </Profiler>
  );
}

/** Wraps a screen component in a `PerfProfiler` during a perf run; returns it untouched otherwise. */
export function profiled<P extends object>(id: string, Screen: ComponentType<P>): ComponentType<P> {
  if (!PERF_RUN) return Screen;
  return function ProfiledScreen(props: P) {
    return (
      <PerfProfiler id={id}>
        <Screen {...props} />
      </PerfProfiler>
    );
  };
}

/** A navigator's `screenLayout` that profiles each route under its name, during a perf run. */
export const perfScreenLayout = PERF_RUN
  ? ({ route, children }: { route: { name: string }; children: ReactNode }) => (
      <PerfProfiler id={route.name}>{children}</PerfProfiler>
    )
  : undefined;

/**
 * During a `screens` run, logs and clears the measurements every 2 s while anything rendered.
 * During a `player` or `tour` run, plays the recently played songs if nothing is loaded.
 */
export function PerfWindows() {
  useEffect(() => {
    if (PERF_MODE === 'player' || PERF_MODE === 'tour') {
      const timer = setTimeout(() => {
        const songs = getHistory();
        if (usePlayerStore.getState().currentSong || !songs.length) return;
        void playNow(songs.slice(0, 10), 0);
      }, AUTOPLAY_DELAY_MS);
      return () => clearTimeout(timer);
    }
    if (PERF_MODE !== 'screens') return;
    const timer = setInterval(() => {
      if (!Object.keys(entries).length) return;
      perfReport('window');
      resetPerf();
    }, WINDOW_MS);
    return () => clearInterval(timer);
  }, []);

  return null;
}

type PerfRunProps = {
  expand: () => void;
  collapse: () => void;
  openPanel: (panel: 'lyrics' | 'queue') => void;
  closePanel: () => void;
};

/**
 * Plays the scripted session during a `player` run. Render it inside the player surface, as its
 * own component, so its re-renders don't re-render what's being measured. From the moment a song
 * loads: 8 s to settle, then 10 s each of mini player playing, full player playing, full player
 * paused, a skip to the next track, lyrics, and queue. Ratios between windows matter; dev builds
 * inflate the absolute times.
 */
export function PerfRun({ expand, collapse, openPanel, closePanel }: PerfRunProps) {
  useEffect(() => {
    if (PERF_MODE !== 'player') return;
    // [at ms, window to report first (if any), then what to do]
    const steps: [number, string | null, () => unknown][] = [
      [8000, null, resetPerf],
      [18000, 'mini playing 10s', expand],
      [20000, null, resetPerf],
      [30000, 'full playing 10s', pause],
      [31000, null, resetPerf],
      [41000, 'full paused 10s', play],
      [42000, null, resetPerf],
      [43000, null, next],
      [53000, 'full next track 10s', () => openPanel('lyrics')],
      [54000, null, resetPerf],
      [64000, 'lyrics 10s', () => openPanel('queue')],
      [65000, null, resetPerf],
      [
        75000,
        'queue 10s',
        () => {
          closePanel();
          collapse();
        },
      ],
    ];
    const timers = steps.map(([at, label, action]) =>
      setTimeout(() => {
        if (label) perfReport(label);
        void action();
      }, at),
    );
    return () => timers.forEach(clearTimeout);
  }, [expand, collapse, openPanel, closePanel]);

  return null;
}

type TourStop = { label: string; href: string; pushed: boolean };

// Detail screens take their ids from what's on the device: the last played song, the first chart
// and the first user playlist. Stops without one are skipped.
function tourStops(): TourStop[] {
  const song = getHistory()[0];
  const chart = queryClient.getQueryData(homeQueries.charts.queryKey)?.[0];
  const playlist = getAllPlaylists()[0];
  const stops: (TourStop | null)[] = [
    { label: 'Search', href: '/search', pushed: false },
    { label: 'Library', href: '/library', pushed: false },
    { label: 'Liked Songs', href: '/liked-songs', pushed: true },
    { label: 'History', href: '/history', pushed: true },
    { label: 'Playlists', href: '/playlists', pushed: true },
    playlist
      ? { label: 'Playlist (yours)', href: `/playlist-detail/${playlist.id}`, pushed: true }
      : null,
    { label: 'Downloads', href: '/downloads', pushed: true },
    { label: 'Settings', href: '/settings', pushed: true },
    { label: 'Playback settings', href: '/settings/playback', pushed: true },
    { label: 'About', href: '/settings/about', pushed: true },
    { label: 'Home', href: '/', pushed: false },
    song?.albumId ? { label: 'Album', href: `/album/${song.albumId}`, pushed: true } : null,
    song?.artistId ? { label: 'Artist', href: `/artist/${song.artistId}`, pushed: true } : null,
    chart ? { label: 'Playlist (JioSaavn)', href: `/playlist/${chart.id}`, pushed: true } : null,
  ];
  return stops.filter((stop) => stop !== null);
}

/** Opens almost every screen in turn during a `tour` run; render it once at the root. */
export function PerfTour() {
  useEffect(() => {
    if (PERF_MODE !== 'tour') return;
    let cancelled = false;
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    void (async () => {
      await wait(TOUR_START_MS);
      for (const stop of tourStops()) {
        if (cancelled) return;
        resetPerf();
        if (stop.pushed) router.push(stop.href as Href);
        else router.navigate(stop.href as Href);
        await wait(TOUR_OPEN_MS);
        perfReport(`${stop.label} open 5s`);
        resetPerf();
        await wait(TOUR_IDLE_MS);
        perfReport(`${stop.label} idle 3s`);
        if (stop.pushed) {
          router.back();
          await wait(TOUR_BACK_MS);
        }
      }
      console.log('[perf] tour done');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
