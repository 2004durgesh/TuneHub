# TuneHub

React Native + Expo (SDK 57) music player. JioSaavn SDK as the data/audio source. `@expo/ui` for native UI, `expo-symbols` for icons, Reanimated for animations, `react-native-nitro-player` for audio, `react-native-mmkv` for local storage, zustand for state.

No account, no login — local-first. Dark-first UI.

## Layout

- Routes: `src/app/` (Expo Router, `src/app/` is the routes dir; path alias `@/*` → `src/*`).
- Native tabs via `expo-router/unstable-native-tabs` (Home, Search, Library).
- Everything else under `src/`: `theme/`, `types/`, `services/`, `store/`, `hooks/`, `components/`.

## Architecture rules

- UI code NEVER imports `jiosaavn-sdk`. Only `src/services/music/` may. Services return domain models from `@/types`.
- `src/services/music/adapter.ts` is the ONLY place raw SDK objects → domain models.
- UI code NEVER imports `react-native-nitro-player`. Only `src/services/player/` may, and it imports LAZILY (the module throws at import on web/Expo Go — everything is guarded and no-ops when unavailable).
- Three zustand stores in `src/store/`: `playerStore`, `musicStore`, `settingsStore`. Don't mix concerns.
- Stores are pure state; screens/hooks call services then feed results into stores via setters. Stores don't call services.
- MMKV via `src/services/storage/mmkv.ts` (exports `storage`). Liked songs + history + settings + search history persist here.

## Playback model (nitro-player)

- Playback is playlist-based. "Play these songs now" goes through `src/services/player` `playNow(songs, startIndex)` which manages a dedicated queue playlist.
- User playlists are persisted natively via `PlayerQueue` (see `src/services/player/playerQueue.ts`).
- Temp queue: play-next = LIFO, up-next = FIFO.
- Player state reaches the UI through `src/hooks/usePlayer.ts` (bridges nitro-player's `useNowPlaying` etc. → `playerStore`).
- Requires a dev build (`npx expo run:ios` / `run:android`). Won't play in Expo Go or web.

## Components

- `SongRow` is the universal song list item — don't make variants.
- `SongActionSheet` is the universal song context menu — reuse everywhere.
- `AppIcon` (`src/components/AppIcon.tsx`) wraps `expo-symbols` `SymbolView` with a platform name map. Use `AppIcon`, never raw `SymbolView` in screens.
- `@expo/ui` for: Slider, BottomSheet, TextField, Switch, Picker, List, Alert.
- `expo-image` for ALL images (blurhash placeholder, disk cache).
- Custom Reanimated components for animations, artwork atmosphere, MiniPlayer, NowPlaying.

## Styling

- No hard-coded values that exist in theme. Import from `@/theme`: `colors`, `spacing`, `screenPadding`, `radii`, `typography`, `springs`, `timings`.
- Dark-first. `colors.background = '#0D0D0F'`.
- Spacing scale: xxs4 / xs8 / sm12 / md16 / lg24 / xl32 / xxl48.
- Only filter chips use pill radius; don't pill everything.

## Animations

- `react-native-reanimated` (v4) only. Never `Animated` from RN core.
- Spring configs from `@/theme` `springs` (default `springs.smooth`). Timing from `timings`.
- Gate non-essential animation on `useSettingsStore(s => s.reducedMotion)`.

## Audio quality

- Default `320kbps`, fallback chain `320 → 160 → 96`.
- User setting in `settingsStore.audioQuality`. Pass it into music service calls; the adapter applies it when building `Song.streamUrl`.

## Commands

- `npm start` — Metro. `npm run ios` / `npm run android` — dev client. `npm run lint`.
- Typecheck: `npx tsc --noEmit`.
