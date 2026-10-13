# TuneHub

React Native + Expo (SDK 57) music player. JioSaavn SDK as the data/audio source.

**Native-first UI:** build screens out of `@expo/ui` components and color them with the
`@/theme` `colors` tokens (Material 3 on both platforms — see Colors). Reach for
raw React Native primitives only for custom layout/animation that `@expo/ui` can't
express. `expo-symbols` for icons, Reanimated for animations, `react-native-nitro-player`
for audio, `react-native-mmkv` for local storage, zustand for state.

No account, no login — local-first. Dark-first UI.

**Mobile only:** iOS + Android dev builds. No web, no Expo Go — native modules (nitro-player,
MMKV, Skia, …) are always present, so import them directly; don't add availability guards,
lazy `require`s or web fallbacks.

## Layout

- Routes: `src/app/` (Expo Router, `src/app/` is the routes dir; path alias `@/*` → `src/*`).
- Root `src/app/_layout.tsx` is a `Stack`; the tab group is `src/app/(tabs)/` with a
  `NativeTabs` layout (`expo-router/unstable-native-tabs`): Home, Search, Library.
- Everything else under `src/`: `theme/`, `types/`, `services/`, `store/`, `hooks/`, `components/`.

## Architecture rules

- UI code NEVER imports `jiosaavn-sdk`. Only `src/services/music/` may. Services return domain models from `@/types`.
- `src/services/music/adapter.ts` is the ONLY place raw SDK objects → domain models.
- `jiosaavn-sdk` (≥ 1.1.0, maintained by the project owner) returns clean text (HTML entities
  decoded) and has `songApi.getLyrics(id)` — `lyricsService` wraps it. Fix SDK bugs upstream
  rather than with local patches.
- UI code NEVER imports `react-native-nitro-player` (type-only imports like `Playlist` excepted). Only `src/services/player/` may; the live queue reaches the UI through `useQueue()` (`src/services/player/queue.ts`).
- Zustand stores in `src/store/`: `playerStore`, `musicStore`, `settingsStore`, `downloadStore`,
  `otaStore`. Don't mix concerns.
- UI code NEVER imports `expo-file-system` (only `src/services/downloads/`) or
  `react-native-nitro-ota` / `expo-application` (only `src/services/ota/`).
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
| Value bar                    | `Slider` (`value`, `onValueChange`, `min`, `max`, `step`)                      |
| Playback seek bar            | `SeekSlider` (`src/components/native/`) — seeks once, on release               |
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
src/components/native/SegmentedControl.tsx      # prop types + Android (@expo/ui/jetpack-compose)
src/components/native/SegmentedControl.ios.tsx  # iOS (@expo/ui/swift-ui)
```

Metro picks `.ios.tsx` on iOS and the base file on Android. TypeScript checks against the
base file (no `moduleSuffixes`), so the base file must exist and own the prop types; the
`.ios.tsx` file takes them with `import type` (erased at build, so no self-import). See
`ThemedList` and `SeekSlider`. Screens import the wrapper, never `@expo/ui/swift-ui` or
`/jetpack-compose` directly.

**Use with great sense:** reach for a per-platform native component only when it genuinely
improves the feel. Prefer universal; prefer a wrapper over inline platform branches.

Other UI building blocks:

- `expo-image` for all images (blurhash placeholder, disk cache). Exception: the player
  artwork is drawn by Skia (`ArtworkTransition`) because the track-change shader needs the
  decoded images.
- `expo-symbols` for icons, always via `AppIcon` (`src/components/app-icon.tsx`) — a
  platform name map over `SymbolView`. Never use raw `SymbolView` in screens.
- Custom Reanimated components for animation-heavy surfaces (NowPlaying, artwork
  atmosphere) where `@expo/ui` can't express the motion.

## Colors: Material 3 on both platforms

`@/theme` `colors` is one Material 3 dark palette everywhere (`src/theme/colors.ts`):

- **Android** — live Material You roles via `expo-router` `Color.android.dynamic.*`.
- **iOS / web** — the same roles as static hex (`md3`), a TonalSpot dark scheme from seed
  `#485A8C`. To re-theme, change the seed and regenerate with
  `@material/material-color-utilities` (`SchemeTonalSpot`, dark).
- `Color.android.*` returns `null` on iOS even though it's typed non-null — never use it
  as an iOS value (that silently fell back to purple/pink hexes). Don't use `Color.ios.*`
  UIKit colors either; the app is deliberately Material on iOS too.
- Material dark `primary` is a light tone: anything drawn ON `colors.accent` uses
  `colors.onAccent`, never `colors.text`.
- Components rendering `colors.*` on Android call `useColorScheme()` so React Compiler
  memoization doesn't keep stale dynamic colors.
- `hexColors` = raw hex for Reanimated color interpolation (can't take native color refs).

## Styling (`@/theme`)

- No hard-coded values that exist in theme. Import from `@/theme`: `colors`, `spacing`, `screenPadding`, `radii`, `typography`, `springs`, `timings`.
- Dark-first (`userInterfaceStyle: "dark"`). `colors.background` = Material `background`.
- Spacing scale: xxs4 / xs8 / sm12 / md16 / lg24 / xl32 / xxl48.
- Only filter chips use pill radius; don't pill everything.

## Components

- `SongRow` is the universal song list item — don't make variants.
- `SongActionSheet` is the universal song context menu — reuse everywhere. Wire its
  `onAddToPlaylist` to open `AddToPlaylistSheet` on any screen that shows it.
- `SheetModal` is the universal bottom-sheet base — build every sheet on it.
- `NowPlaying` (`src/components/now-playing/`) is the mini player AND the full player — one
  surface in the root layout above every screen, not a route. A single `progress` shared value
  (0 = mini, 1 = full) morphs it: the container grows from the floating bar to full screen, the
  artwork canvas moves/scales from `MiniBar`'s thumbnail slot to `FullPlayer`'s hero slot, and the
  full chrome is revealed by the growing clip. Tap/swipe up expands; swipe down, the chevron,
  Android back, or any navigation collapses. Lyrics and queue are panels inside the expanded
  player (they replace the artwork), not routes. Never add a `/player` route.
- In the expanded player a swipe up that starts on the artwork reveals the lyrics, tracking the
  finger (`reveal` shared value: the artwork lifts/shrinks/fades, the panel slides in); the
  "Your Queue" text opens the queue the same way; a × closes either. A Pan's `onStart` reports
  `translationY` 0, so a drag on the artwork picks lyrics vs collapse on its first `onUpdate`.
  Shuffle and repeat sit right of the song title, the heart left of it.
- The collapsed bar's position comes from `useMiniPlayerPlacement` (above the native tab bar on
  tab screens, above the safe area on pushed screens — there's no JS API for the tab-bar height,
  so it's iOS 49 / Android 80 dp). Scrolling screens add `useMiniPlayerInset()` to their bottom
  padding so the bar never covers the last rows.
- Write Reanimated shared values with `.set()`/`.get()` in callbacks and gestures — React
  Compiler rejects `.value =` assignments outside effects.

## Playback model (nitro-player)

- Playback is playlist-based. "Play these songs now" goes through `src/services/player` `playNow(songs, startIndex)` which manages a dedicated `__nowplaying__` queue playlist. That reserved playlist is filtered out of user-facing lists in `getAllPlaylists()`.
- User playlists are persisted natively via `PlayerQueue` (see `src/services/player/playerQueue.ts`).
- Temp queue: play-next = LIFO, up-next = FIFO. Live queue via `useQueue()` (`src/services/player/queue.ts`).
- Shuffle is nitro-player's native `PlayerQueue.shufflePlaylist` (needs ≥ 1.7.0-alpha.5), via
  `shuffleUpcoming()`: the current track moves first and keeps playing, every other track is
  shuffled behind it. Shuffle is a mode — while it's on, `playNow` shuffles new lists the same way.
- Equalizer settings apply through `src/services/player/equalizer.ts` (`setEqualizerEnabled`, `applyEqualizerPreset`); persisted EQ re-applies on player setup.
- Player state reaches the UI through `src/hooks/usePlayer.ts` (bridges nitro-player events → `playerStore`).
- Requires a dev build (`npx expo run:ios` / `run:android`). Won't play in Expo Go or web.

## Downloads (offline songs)

- `expo-file-system` (not RNFS). Files live in `Documents/downloads/<songId>.m4a`; transfers write
  `<songId>.part` and are renamed on completion, so a song file only exists complete. Max 2 at once.
- Disk is the source of truth for "is it downloaded": `songToTrack` plays `localSongUri(id)` when the
  file exists, else `streamUrl`, and stashes the remote `streamUrl` in `extraPayload` so songs read
  back from the player (history, likes) never persist a `file://` URL.
- `downloadStore` (MMKV key `downloads`) is UI state: status/progress plus the `Song` snapshot for
  the Downloads screen. `src/hooks/useDownloads.ts` drives it (`downloadSong`, `removeDownload`,
  `removeAllDownloads`); `useDownloadsBridge()` in the root layout restarts unfinished downloads
  and drops records whose file is gone.
- Downloads start from `SongActionSheet` (one song, `single: true`) or `DownloadAllButton` (albums
  and playlists: download all → progress `n/total`, tap to stop → all done, tap to remove).
  `DownloadAllButton` saves a `DownloadCollection` (MMKV key `download_collections`, id
  `album:` / `playlist:` / `library:` + source id) listing its song ids.
- A song file is shared: removing or stopping a collection only deletes songs that aren't
  `single` and aren't in another collection; removing a song deletes it from every collection.
- `/downloads` (Library → Downloads) groups by collection — collapsible headers (long-press to
  remove) — then a "Songs" section for single downloads.

## OTA updates & releases

- JS-only updates via `react-native-nitro-ota`, hosted as assets on the binary's own GitHub release
  (`v<version>`): `ota-<platform>.json` manifest + zip (+ bsdiff patches). `useOtaUpdates()` (root
  layout, release builds only) confirms the running bundle and downloads newer ones;
  `UpdateToast` shows progress and offers a restart; Settings → About shows the running bundle.
- OTAs target the binary's version (`expo-application` `nativeApplicationVersion`), so a bundle
  never runs on native code it wasn't built for. Native changes (new modules, config) need a new
  binary release; only ship JS-only changes as OTA.
- `npm run release` (release-it, needs `GITHUB_TOKEN`): conventional changelog, bump, then the
  `after:bump` hooks — `scripts/sync-versions.js` copies the version into `app.json`,
  `android/app/build.gradle` and `ios/tunehub/Info.plist` (and bumps the build number),
  `npm run build-android` builds per-ABI release APKs (`tunehub-<abi>-v<version>.apk`, signed with
  the debug keystore) and `npm run build-ios` an unsigned sideload `.ipa` — then commits, tags
  `v<version>` and creates the GitHub release with the APKs and IPA attached. JS-only updates for
  that binary: `npm run ota` (`scripts/publish-ota.sh`, needs `GITHUB_TOKEN`).
- nitro-ota's native hooks are applied by hand to the committed native projects (its Expo plugin is
  in `app.json` for future prebuilds): `MainApplication.kt` passes `jsBundleFilePath =
getStoredBundlePath(applicationContext)`, `AppDelegate.swift` returns
  `NitroOtaBundleManager.shared.getStoredBundlePath()` in release, and the Podfile adds
  `pod "NitroOtaBundleManager"`. nitro-ota pins `react-native-nitro-modules` to exactly `0.35.1`.
- `npx expo prebuild` regenerates (wipes) `ios/` and `android/` — avoid it; edit native files directly.

## Animations & atmosphere

- `react-native-reanimated` (v4) only. Never `Animated` from RN core.
- Spring configs from `@/theme` `springs` (default `springs.smooth`). Timing from `timings`.
- Dynamic artwork atmosphere: `src/hooks/useArtworkColors.ts` extracts a four-color palette
  with Skia (decode → 24×24 CPU surface → bucket the pixels), cached per URL. The mini bar tints
  toward it; the expanded player renders `PlayerBackdrop` (Skia): blurred palette blobs drifting
  over the dark base, crossfading between tracks.
- Skia is `react-native-skia` (v3, Graphite backend) — the renamed successor of
  `@shopify/react-native-skia`; never install the old package. Skia `color` props need hex
  strings (`hexColors`), not RN `ColorValue`. Drive Skia props with Reanimated shared/derived
  values directly (no React re-renders per frame).
- Track changes in the player dissolve the artwork with a runtime shader
  (`src/components/ArtworkTransition.tsx`); it starts only after the new image decodes.
- Gate non-essential animation/atmosphere on `useSettingsStore(s => s.reducedMotion)` and
  `useSettingsStore(s => s.dynamicAtmosphere)`.

## Audio quality

- Default `320kbps`, fallback chain `320 → 160 → 96`.
- User setting in `settingsStore.audioQuality`. Pass it into music service calls; the adapter applies it when building `Song.streamUrl`.

## Commands

- `npm start` — Metro. `npm run ios` / `npm run android` — dev client. `npm run lint`.
- Typecheck: `npx tsc --noEmit`.
- `npm run release` — new binary version. `npm run ota` — publish a JS-only update for it.
