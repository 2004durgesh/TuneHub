import { PlayerQueue, type Playlist } from 'react-native-nitro-player';
import type { Song } from '@/types';
import { songToTrack } from './trackAdapter';
import { NOW_PLAYING_NAME } from './nitroPlayer';

/** Create a user playlist, returning its id. */
export async function createPlaylist(name: string): Promise<string> {
  return PlayerQueue.createPlaylist(name);
}

export async function deletePlaylist(id: string): Promise<void> {
  await PlayerQueue.deletePlaylist(id);
}

export async function renamePlaylist(id: string, name: string): Promise<void> {
  await PlayerQueue.updatePlaylist(id, name);
}

/** All user playlists. */
export function getAllPlaylists(): Playlist[] {
  // Hide the internal now-playing queue from user-facing playlist lists.
  return PlayerQueue.getAllPlaylists().filter((p) => p.name !== NOW_PLAYING_NAME);
}

export function getPlaylist(id: string): Playlist | null {
  return PlayerQueue.getPlaylist(id);
}

export async function addSongToPlaylist(id: string, song: Song): Promise<void> {
  await PlayerQueue.addTrackToPlaylist(id, songToTrack(song));
}

export async function removeSongFromPlaylist(id: string, songId: string): Promise<void> {
  await PlayerQueue.removeTrackFromPlaylist(id, songId);
}

export async function reorderSong(id: string, songId: string, newIndex: number): Promise<void> {
  await PlayerQueue.reorderTrackInPlaylist(id, songId, newIndex);
}
