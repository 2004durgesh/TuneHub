import { PlayerQueue, TrackPlayer } from 'react-native-nitro-player';
import type { RepeatMode, Song } from '@/types';
import { songToTrack, trackToSong } from './trackAdapter';

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

let configured = false;

export async function setupPlayer(): Promise<void> {
  if (configured) return;
  await TrackPlayer.configure({
    showInNotification: true,
    lookaheadCount: 5,
  });
  configured = true;
}

// ---------------------------------------------------------------------------
// Transport controls (thin wrappers)
// ---------------------------------------------------------------------------

export async function play(): Promise<void> {
  await TrackPlayer.play();
}

export async function pause(): Promise<void> {
  await TrackPlayer.pause();
}

export async function next(): Promise<void> {
  await TrackPlayer.skipToNext();
}

export async function previous(): Promise<void> {
  // skipToPrevious on the first track stops playback; restart the song instead.
  const { currentIndex } = await TrackPlayer.getState();
  if (currentIndex <= 0) {
    await TrackPlayer.seek(0);
    return;
  }
  await TrackPlayer.skipToPrevious();
}

export async function seek(pos: number): Promise<void> {
  await TrackPlayer.seek(pos);
}

export async function setVolume(v: number): Promise<void> {
  await TrackPlayer.setVolume(v);
}

export async function setRepeat(mode: RepeatMode): Promise<void> {
  await TrackPlayer.setRepeatMode(mode);
}

export async function setSpeed(s: number): Promise<void> {
  await TrackPlayer.setPlaybackSpeed(s);
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
async function ensureNowPlaying(): Promise<string> {
  if (nowPlayingId) return nowPlayingId;
  const existing = PlayerQueue.getAllPlaylists().find((p) => p.name === NOW_PLAYING_NAME);
  if (existing) {
    nowPlayingId = existing.id;
    return nowPlayingId;
  }
  nowPlayingId = await PlayerQueue.createPlaylist(NOW_PLAYING_NAME);
  return nowPlayingId;
}

/**
 * Replace the now-playing queue with `songs` and start playback at
 * `startIndex`. Playback is playlist-based, so we recreate the dedicated
 * queue playlist each time to guarantee a clean slate. With `shuffle`, the
 * tapped song plays first and all the others follow in random order.
 */
export async function playNow(songs: Song[], startIndex = 0, shuffle = false): Promise<void> {
  if (songs.length === 0) return;

  // Recreate the playlist to clear any prior contents.
  const prev = PlayerQueue.getAllPlaylists().find((p) => p.name === NOW_PLAYING_NAME);
  if (prev) {
    await PlayerQueue.deletePlaylist(prev.id);
  }
  nowPlayingId = await PlayerQueue.createPlaylist(NOW_PLAYING_NAME);

  await PlayerQueue.addTracksToPlaylist(nowPlayingId, songs.map(songToTrack));
  await PlayerQueue.loadPlaylist(nowPlayingId, startIndex);
  // Once loaded, the tapped song is the current track, which the shuffle pins first.
  if (shuffle) await PlayerQueue.shufflePlaylist(nowPlayingId);
  await TrackPlayer.play();
}

/**
 * Queue a song to play immediately after the current track.
 * Registers the track first so the temporary queue can resolve it by id.
 */
export async function playNext(song: Song): Promise<void> {
  const track = songToTrack(song);
  await PlayerQueue.addTracksToPlaylist(await ensureNowPlaying(), [track]);
  await TrackPlayer.playNext(track.id);
}

/** Append a song to the end of the up-next queue. */
export async function addToUpNext(song: Song): Promise<void> {
  const track = songToTrack(song);
  await PlayerQueue.addTracksToPlaylist(await ensureNowPlaying(), [track]);
  await TrackPlayer.addToUpNext(track.id);
}

/** Alias kept for call sites that think in terms of a generic "add to queue". */
export const addToQueue = addToUpNext;

/** The song that plays after the current one, in actual play order, or null at the end. */
export async function getUpNextSong(): Promise<Song | null> {
  const [queue, { currentTrack }] = await Promise.all([
    TrackPlayer.getActualQueue(),
    TrackPlayer.getState(),
  ]);
  if (!currentTrack) return null;
  const next = queue[queue.findIndex((track) => track.id === currentTrack.id) + 1];
  return next ? trackToSong(next) : null;
}

/**
 * Shuffle the now-playing queue: the current track moves to the front and keeps
 * playing uninterrupted, and every other track (already-played ones too) is
 * shuffled behind it. One native pass that also updates the live queue.
 */
export async function shuffleUpcoming(): Promise<void> {
  // Ask the player what's playing: the module cache (`nowPlayingId`) is empty after a JS reload
  // while native playback carries on. Only ever shuffle our reserved queue playlist, never a
  // user's saved one (the shuffle is persisted).
  const playlistId = PlayerQueue.getCurrentPlaylistId();
  if (!playlistId || PlayerQueue.getPlaylist(playlistId)?.name !== NOW_PLAYING_NAME) return;
  await PlayerQueue.shufflePlaylist(playlistId);
}
