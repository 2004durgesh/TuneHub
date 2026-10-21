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

/** Appends the songs the playlist doesn't have yet, in order, and returns how many it added. */
export async function addSongsToPlaylist(id: string, songs: readonly Song[]): Promise<number> {
  const present = new Set(PlayerQueue.getPlaylist(id)?.tracks.map((track) => track.id));
  const fresh: Song[] = [];
  for (const song of songs) {
    if (present.has(song.id)) continue;
    present.add(song.id);
    fresh.push(song);
  }
  if (fresh.length > 0) await PlayerQueue.addTracksToPlaylist(id, fresh.map(songToTrack));
  return fresh.length;
}

export async function removeSongFromPlaylist(id: string, songId: string): Promise<void> {
  await PlayerQueue.removeTrackFromPlaylist(id, songId);
}

export async function reorderSong(id: string, songId: string, newIndex: number): Promise<void> {
  await PlayerQueue.reorderTrackInPlaylist(id, songId, newIndex);
}
