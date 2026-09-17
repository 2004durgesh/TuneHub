# TuneHub

React Native + Expo (SDK 57) music player. JioSaavn SDK as the data/audio source.

**Native-first UI:** build screens out of `@expo/ui` components and color them with
`expo-router`'s `Color` API so the app matches each platform's system look. Reach for
raw React Native primitives only for custom layout/animation that `@expo/ui` can't
express. `expo-symbols` for icons, Reanimated for animations, `react-native-nitro-player`
for audio, `react-native-mmkv` for local storage, zustand for state.

No account, no login — local-first. Dark-first UI.

## Layout

- Routes: `src/app/` (Expo Router, `src/app/` is the routes dir; path alias `@/*` → `src/*`).
- Root `src/app/_layout.tsx` is a `Stack`; the tab group is `src/app/(tabs)/` with a
  `NativeTabs` layout (`expo-router/unstable-native-tabs`): Home, Search, Library.
- Everything else under `src/`: `theme/`, `types/`, `services/`, `store/`, `hooks/`, `components/`.

## Architecture rules

- UI code NEVER imports `jiosaavn-sdk`. Only `src/services/music/` may. Services return domain models from `@/types`.
- `src/services/music/adapter.ts` is the ONLY place raw SDK objects → domain models.
- UI code NEVER imports `react-native-nitro-player`. Only `src/services/player/` may, and it imports LAZILY (the module throws at import on web/Expo Go — everything is guarded and no-ops when unavailable). The one exception is the queue hook (`src/services/player/queue.ts`), which resolves `useActualQueue` once at module load behind a `Platform`/try-catch guard.
- Three zustand stores in `src/store/`: `playerStore`, `musicStore`, `settingsStore`. Don't mix concerns.
- Stores are pure state; screens/hooks call services then feed results into stores via setters. Stores don't call services.
- MMKV via `src/services/storage/mmkv.ts` (exports `storage`). Liked songs + history + settings + search history persist here.

## UI: `@expo/ui` (native components)

Default to `@expo/ui` for controls and native chrome. Import universal components from
`@expo/ui`; they render real SwiftUI on iOS and Jetpack Compose on Android.

**Available universal components** (`import { … } from '@expo/ui'`, v57.0.18):
`Host`, `Column`, `Row`, `Text`, `Button`, `ScrollView`, `Switch`, `Slider`, `Checkbox`,
`Picker`, `List`, `ListItem`, `Collapsible`, `FieldGroup`, `Icon`, `Spacer`, `TextInput`.

Map controls to `@expo/ui`:

| Need                         | Use                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------ |
| Toggle                       | `Switch` (`value`, `onValueChange`, `label`)                                   |
| Seek / value bar             | `Slider` (`value`, `onValueChange`, `min`, `max`, `step`)                      |
| Option list / quality picker | `Picker` + `Picker.Item`                                                       |
| Grouped settings rows        | `List` + `ListItem`                                                            |
| Text field / search input    | `TextInput` (RN-TextInput-like: `value`, `onChangeText`, `placeholder`, `ref`) |
| Push button                  | `Button` (`label`/`children`, `onPress`, `variant`)                            |

**Rules & gotchas (verified against node_modules):**

- Some `@expo/ui` components must be mounted inside a `Host` (or another `@expo/ui`
  container like `Row`/`Column`). If a control renders blank, wrap it in `Host`.
- `UniversalStyle` (the `style` prop on `@expo/ui` components) is a LIMITED subset of
  `ViewStyle` — only `padding*`, `backgroundColor`, `border*`, `borderRadius`, `opacity`,
  `width`, `height`. No flexbox. For layout use `@expo/ui` `Row`/`Column`/`Spacer`, or a
  plain RN `View`.
- **Native `BottomSheet` (`@expo/ui`) — use this exact recipe** (see `src/components/SheetModal.tsx`):
  - OMIT `snapPoints` so the sheet auto-sizes to its content (passing them, or nothing,
    made it default to a ~half-height detent — that was the old "50%" bug).
  - RN views placed DIRECTLY in a `BottomSheet` render but DON'T receive touches. Wrap the
    RN subtree in `<RNHostView>` (a single child — wrap multiple in one `View`) so it
    bridges into the native Compose/SwiftUI tree and stays interactive.
  - Do NOT put `matchContents` on that `RNHostView` — it collapses to zero and the sheet
    won't open. Let it fill the parent (default).
  - `containerColor`/`contentColor` set the sheet's native background/foreground.
  - Two sheets still can't transition instantly (see the rule below); `SongActionSheet`
    delays opening `AddToPlaylistSheet` by ~350ms.
- Two Modals can't present at once on Android (and a modal can't present while another
  dismisses). When one sheet opens another, close the first, then open the next after it
  finishes animating (`SongActionSheet` already does this with a ~350ms delay).
- **`List` (native grouped list) — use this exact pattern.** `List` is a Compose
  `LazyColumn` / SwiftUI `List`, i.e. an infinitely-scrollable container. It MUST live in a
  **bounded, full-height** `Host`: `<Host style={{ flex: 1 }} colorScheme="dark">`.
  - NEVER wrap `List` in `<Host matchContents>` and NEVER put it inside a RN `ScrollView` —
    Compose then measures it with an infinite height constraint and throws in
    `HostView.onMeasure`, which tears down the whole React surface (blank/white screen, app
    exits). See `src/app/settings/index.tsx` for the working reference.
  - `List` IS the scroller — one full-screen `List` per screen, no outer ScrollView. Put a
    plain RN header above it, then the `Host`/`List` fills the rest.
  - `colorScheme="dark"` on the `Host` themes the native list dark.
  - `ListItem` slots: `leading` (an `AppIcon` composes fine), `trailing` (a `Switch`
    composes fine — but a plain `Text` is greedy and squeezes the headline to 1 char; put
    values in `supportingText` instead), `supportingText` (subtitle), `onPress` (row tap).
  - Headline is the ListItem's string child.

### Three surfaces — universal is small; the rich components are per-platform

`@expo/ui` ships three entry points. Universal is the small shared subset; the
platform surfaces are where the good-looking native components live:

- `@expo/ui` — **universal** (the list above). Small, safe, cross-platform.
- `@expo/ui/swift-ui` — **iOS** (SwiftUI): `ContextMenu`, `Menu`, `Form`, `Section`,
  `Gauge`, `Chart`, `DatePicker`, `Stepper`, `Toggle`, `SwipeActions`, `ShareLink`,
  `ContentUnavailableView`, `Popover`, `ProgressView`, `GlassEffectContainer`, `TabView`, …
- `@expo/ui/jetpack-compose` — **Android** (Compose): `SearchBar`/`DockedSearchBar`,
  `SegmentedButton`, `DropdownMenu`, `Card`, `Chip`, `Carousel`, `ModalBottomSheet`,
  `PullToRefreshBox`, `FloatingActionButton`, `Snackbar`, `Tooltip`, `Badge`, …
- `@expo/ui/community/*` — gorhom/community wrappers: `bottom-sheet`, `segmented-control`,
  `picker`, `slider`, `menu`, `datetime-picker`, `pager-view`, `masked-view` (peer deps
  may be needed; check before importing).

**Convention — wrap platform components into a "kinda universal" component.**
When universal lacks a control that would clearly look better native (e.g. a segmented
control, a context menu, a search bar), don't scatter `Platform.OS` checks in screens.
Create a wrapper in `src/components/native/` that exposes ONE cross-platform prop API and
picks the surface internally, via file-split:

```
src/components/native/SegmentedControl.tsx        # shared types + default/fallback
src/components/native/SegmentedControl.ios.tsx     # uses @expo/ui/swift-ui
src/components/native/SegmentedControl.android.tsx # uses @expo/ui/jetpack-compose
```

Metro resolves `.ios.tsx`/`.android.tsx` automatically; the base file is the web/Expo Go
fallback (a plain RN implementation so the app still renders where native isn't available).
Screens import the wrapper, never `@expo/ui/swift-ui` or `/jetpack-compose` directly.

**Use with great sense:** reach for a per-platform native component only when it genuinely
improves the feel. Prefer universal; prefer a wrapper over inline platform branches; always
keep a plain-RN fallback in the base file so web/Expo Go never crash.

Other UI building blocks:

- `expo-image` for ALL images (blurhash placeholder, disk cache).
- `expo-symbols` for icons, always via `AppIcon` (`src/components/app-icon.tsx`) — a
  platform name map over `SymbolView`. Never use raw `SymbolView` in screens.
- Custom Reanimated components for animation-heavy surfaces (MiniPlayer, NowPlaying,
  artwork atmosphere) where `@expo/ui` can't express the motion.

## Colors: `expo-router` `Color` for native surfaces

For native chrome (tab bar, and any surface meant to feel like the OS), color with
`expo-router`'s `Color` API so it adapts to the platform:

```ts
import { Color } from 'expo-router';
import { Platform, useColorScheme } from 'react-native';

const surface = Platform.select({
  ios: Color.ios.systemBackground, // UIKit semantic — auto light/dark
  android: Color.android.dynamic.surface, // Material You, wallpaper-adaptive
  default: colors.background,
});
```

- `Color.ios.*` — UIKit semantic colors (`systemBackground`, `label`, `separator`,
  `systemBlue`, …). Auto-adapt to appearance; no `useColorScheme` needed.
- `Color.android.dynamic.*` — Material You (SDK 31+, wallpaper-adaptive).
- `Color.android.material.*` — Material 3 static roles. `Color.android.attr.*` — theme attrs.
- **Any component that reads `Color.android.*` MUST call `useColorScheme()` in its body**
  so it re-renders on theme change (React Compiler memoization otherwise keeps it stale).
- `Color` is for NATIVE surfaces only. All app content (text, cards, rows, artwork frames)
  still uses the dark-first tokens in `@/theme` — don't mix the two on the same element.

## Styling (`@/theme`)

- No hard-coded values that exist in theme. Import from `@/theme`: `colors`, `spacing`, `screenPadding`, `radii`, `typography`, `springs`, `timings`.
- Dark-first. `colors.background = '#0D0D0F'`.
- Spacing scale: xxs4 / xs8 / sm12 / md16 / lg24 / xl32 / xxl48.
- Only filter chips use pill radius; don't pill everything.

## Components

- `SongRow` is the universal song list item — don't make variants.
- `SongActionSheet` is the universal song context menu — reuse everywhere. Wire its
  `onAddToPlaylist` to open `AddToPlaylistSheet` on any screen that shows it.
- `SheetModal` is the universal bottom-sheet base — build every sheet on it.
- `MiniPlayer` renders as a floating overlay in `src/app/(tabs)/_layout.tsx`, positioned
  above the native tab bar. There is no JS API for the native tab-bar height, so its offset
  is a platform constant (iOS 49 / Android 80 dp) + safe-area bottom inset.

## Playback model (nitro-player)

- Playback is playlist-based. "Play these songs now" goes through `src/services/player` `playNow(songs, startIndex)` which manages a dedicated `__nowplaying__` queue playlist. That reserved playlist is filtered out of user-facing lists in `getAllPlaylists()`.
- User playlists are persisted natively via `PlayerQueue` (see `src/services/player/playerQueue.ts`).
- Temp queue: play-next = LIFO, up-next = FIFO. Live queue via `useQueue()` (`src/services/player/queue.ts`).
- Shuffle reorders the upcoming tracks in place (`shuffleUpcoming`); the current track keeps playing.
- Equalizer settings apply through `src/services/player/equalizer.ts` (`setEqualizerEnabled`, `applyEqualizerPreset`); persisted EQ re-applies on player setup.
- Player state reaches the UI through `src/hooks/usePlayer.ts` (bridges nitro-player events → `playerStore`).
- Requires a dev build (`npx expo run:ios` / `run:android`). Won't play in Expo Go or web.

## Animations & atmosphere

- `react-native-reanimated` (v4) only. Never `Animated` from RN core.
- Spring configs from `@/theme` `springs` (default `springs.smooth`). Timing from `timings`.
- Dynamic artwork atmosphere: `src/hooks/useArtworkColors.ts` extracts a palette via
  `react-native-image-colors` (guarded; null on web/Expo Go). The player and MiniPlayer
  tint their background toward it.
- Gate non-essential animation/atmosphere on `useSettingsStore(s => s.reducedMotion)` and
  `useSettingsStore(s => s.dynamicAtmosphere)`.

## Audio quality

- Default `320kbps`, fallback chain `320 → 160 → 96`.
- User setting in `settingsStore.audioQuality`. Pass it into music service calls; the adapter applies it when building `Song.streamUrl`.

## Commands

- `npm start` — Metro. `npm run ios` / `npm run android` — dev client. `npm run lint`.
- Typecheck: `npx tsc --noEmit`.
