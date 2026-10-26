import type { RepeatMode } from '@/types';
import { storage } from './mmkv';

const KEY = 'playback_session';

/**
 * Where playback stood, to reopen it after a restart. The queue itself isn't here: it's
 * nitro-player's now-playing playlist, which the player saves natively.
 */
export type PlaybackSession = {
  trackId: string;
  position: number;
  shuffle: boolean;
  repeat: RepeatMode;
};

export function getPlaybackSession(): PlaybackSession | null {
  const raw = storage.getString(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PlaybackSession;
  } catch {
    return null;
  }
}

export function savePlaybackSession(session: PlaybackSession): void {
  storage.set(KEY, JSON.stringify(session));
}
