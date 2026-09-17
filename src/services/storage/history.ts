import { storage } from './mmkv';
import type { Song } from '@/types';

const KEY = 'history';
const MAX = 100;

export function getHistory(): Song[] {
  const raw = storage.getString(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Song[];
  } catch {
    return [];
  }
}

export function addToHistory(song: Song): Song[] {
  const deduped = getHistory().filter((s) => s.id !== song.id);
  const next = [song, ...deduped].slice(0, MAX);
  storage.set(KEY, JSON.stringify(next));
  return next;
}

export function clearHistory(): void {
  storage.remove(KEY);
}
