import { Platform } from 'react-native';
import type { Playlist } from 'react-native-nitro-player';
import type { Song } from '@/types';
import { songToTrack } from './trackAdapter';
import { NOW_PLAYING_NAME } from './nitroPlayer';

// Same lazy/guarded access pattern as nitroPlayer.ts — this module is one of
// the only allowed importers of react-native-nitro-player.
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

/** Create a user playlist, returning its id (or '' when unavailable). */
export async function createPlaylist(name: string): Promise<string> {
  const m = getMod();
  if (!m) return '';
  return m.PlayerQueue.createPlaylist(name);
}

export async function deletePlaylist(id: string): Promise<void> {
  const m = getMod();
  if (!m) return;
  await m.PlayerQueue.deletePlaylist(id);
}

export async function renamePlaylist(id: string, name: string): Promise<void> {
  const m = getMod();
  if (!m) return;
  await m.PlayerQueue.updatePlaylist(id, name);
}

/** All user playlists, or [] when the native module is unavailable. */
export function getAllPlaylists(): Playlist[] {
  const m = getMod();
  if (!m) return [];
  // Hide the internal now-playing queue from user-facing playlist lists.
  return m.PlayerQueue.getAllPlaylists().filter((p) => p.name !== NOW_PLAYING_NAME);
}

export function getPlaylist(id: string): Playlist | null {
  const m = getMod();
  if (!m) return null;
  return m.PlayerQueue.getPlaylist(id);
}

export async function addSongToPlaylist(id: string, song: Song): Promise<void> {
  const m = getMod();
  if (!m) return;
  await m.PlayerQueue.addTrackToPlaylist(id, songToTrack(song));
}

export async function removeSongFromPlaylist(id: string, songId: string): Promise<void> {
  const m = getMod();
  if (!m) return;
  await m.PlayerQueue.removeTrackFromPlaylist(id, songId);
}

export async function reorderSong(id: string, songId: string, newIndex: number): Promise<void> {
  const m = getMod();
  if (!m) return;
  await m.PlayerQueue.reorderTrackInPlaylist(id, songId, newIndex);
}
