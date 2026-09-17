import { Platform } from 'react-native';
import type { RepeatMode, Song } from '@/types';
import { songToTrack } from './trackAdapter';

// react-native-nitro-player's index calls NitroModules.createHybridObject(...)
// at import time, which throws on web / Expo Go where the native module is
// absent. Import it lazily and guard every access.
type NitroModule = typeof import('react-native-nitro-player');

let mod: NitroModule | null = null;

function getMod(): NitroModule | null {
  if (Platform.OS === 'web') return null;
  if (mod) return mod;
  try {
    mod = require('react-native-nitro-player');
    return mod;
  } catch (e) {
    console.warn('[player] nitro-player unavailable', e);
    return null;
  }
}

/** True when the native player module is loadable on this platform. */
export function isPlayerAvailable(): boolean {
  return getMod() !== null;
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

let configured = false;

export async function setupPlayer(): Promise<void> {
  if (configured) return;
  const m = getMod();
  if (!m) return;
  await m.TrackPlayer.configure({
    showInNotification: true,
    lookaheadCount: 5,
  });
  configured = true;
}

// ---------------------------------------------------------------------------
// Transport controls (thin wrappers)
// ---------------------------------------------------------------------------

export async function play(): Promise<void> {
  const m = getMod();
  if (!m) return;
  await m.TrackPlayer.play();
}

export async function pause(): Promise<void> {
  const m = getMod();
  if (!m) return;
  await m.TrackPlayer.pause();
}

export async function next(): Promise<void> {
  const m = getMod();
  if (!m) return;
  await m.TrackPlayer.skipToNext();
}

export async function previous(): Promise<void> {
  const m = getMod();
  if (!m) return;
  await m.TrackPlayer.skipToPrevious();
}

export async function seek(pos: number): Promise<void> {
  const m = getMod();
  if (!m) return;
  await m.TrackPlayer.seek(pos);
}

export async function setVolume(v: number): Promise<void> {
  const m = getMod();
  if (!m) return;
  await m.TrackPlayer.setVolume(v);
}

export async function setRepeat(mode: RepeatMode): Promise<void> {
  const m = getMod();
  if (!m) return;
  await m.TrackPlayer.setRepeatMode(mode);
}

export async function setSpeed(s: number): Promise<void> {
  const m = getMod();
  if (!m) return;
  await m.TrackPlayer.setPlaybackSpeed(s);
}

// ---------------------------------------------------------------------------
// Now-playing queue
// ---------------------------------------------------------------------------

export const NOW_PLAYING_NAME = '__nowplaying__';
let nowPlayingId: string | null = null;

/**
 * Ensure the dedicated now-playing playlist exists and return its id.
 * Looks it up by name first (survives module reloads), then creates it once.
 */
async function ensureNowPlaying(m: NitroModule): Promise<string> {
  if (nowPlayingId) return nowPlayingId;
  const existing = m.PlayerQueue.getAllPlaylists().find((p) => p.name === NOW_PLAYING_NAME);
  if (existing) {
    nowPlayingId = existing.id;
    return nowPlayingId;
  }
  nowPlayingId = await m.PlayerQueue.createPlaylist(NOW_PLAYING_NAME);
  return nowPlayingId;
}

/**
 * Replace the now-playing queue with `songs` and start playback at
 * `startIndex`. Playback is playlist-based, so we recreate the dedicated
 * queue playlist each time to guarantee a clean slate.
 */
export async function playNow(songs: Song[], startIndex = 0): Promise<void> {
  const m = getMod();
  if (!m || songs.length === 0) return;

  // Recreate the playlist to clear any prior contents.
  const prev = m.PlayerQueue.getAllPlaylists().find((p) => p.name === NOW_PLAYING_NAME);
  if (prev) {
    await m.PlayerQueue.deletePlaylist(prev.id);
  }
  nowPlayingId = await m.PlayerQueue.createPlaylist(NOW_PLAYING_NAME);

  const tracks = songs.map(songToTrack);
  await m.PlayerQueue.addTracksToPlaylist(nowPlayingId, tracks);
  await m.PlayerQueue.loadPlaylist(nowPlayingId, startIndex);
  await m.TrackPlayer.play();
}

/**
 * Queue a song to play immediately after the current track.
 * Registers the track first so the temporary queue can resolve it by id.
 */
export async function playNext(song: Song): Promise<void> {
  const m = getMod();
  if (!m) return;
  const track = songToTrack(song);
  await m.PlayerQueue.addTracksToPlaylist(await ensureNowPlaying(m), [track]);
  await m.TrackPlayer.playNext(track.id);
}

/** Append a song to the end of the up-next queue. */
export async function addToUpNext(song: Song): Promise<void> {
  const m = getMod();
  if (!m) return;
  const track = songToTrack(song);
  await m.PlayerQueue.addTracksToPlaylist(await ensureNowPlaying(m), [track]);
  await m.TrackPlayer.addToUpNext(track.id);
}

/** Alias kept for call sites that think in terms of a generic "add to queue". */
export const addToQueue = addToUpNext;

/**
 * Shuffle the tracks that come AFTER the currently playing one in the
 * now-playing queue. The current track keeps playing uninterrupted; only the
 * upcoming order changes. No-op when fewer than two upcoming tracks exist.
 */
export async function shuffleUpcoming(currentTrackId: string): Promise<void> {
  const m = getMod();
  if (!m || !nowPlayingId) return;
  const pl = m.PlayerQueue.getPlaylist(nowPlayingId);
  if (!pl) return;

  const curIdx = pl.tracks.findIndex((t) => t.id === currentTrackId);
  const upcoming = pl.tracks.slice(curIdx + 1);
  if (upcoming.length < 2) return;

  // Fisher–Yates shuffle of the upcoming slice.
  for (let i = upcoming.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [upcoming[i], upcoming[j]] = [upcoming[j], upcoming[i]];
  }

  // Apply the new order by moving each track to its target absolute index.
  for (let k = 0; k < upcoming.length; k++) {
    await m.PlayerQueue.reorderTrackInPlaylist(nowPlayingId, upcoming[k].id, curIdx + 1 + k);
  }
}
