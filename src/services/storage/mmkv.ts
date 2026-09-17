import { createMMKV } from 'react-native-mmkv';

// Minimal surface we rely on across the app.
export type KeyValueStore = {
  getString(key: string): string | undefined;
  set(key: string, value: string | boolean | number): void;
  remove(key: string): void;
};

// In-memory fallback so Metro web bundling / Expo Go don't crash when the
// native MMKV module is unavailable. Native builds always use real MMKV.
function createFallback(): KeyValueStore {
  const map = new Map<string, string>();
  return {
    getString: (k) => map.get(k),
    set: (k, v) => map.set(k, String(v)),
    remove: (k) => void map.delete(k),
  };
}

function createStore(): KeyValueStore {
  try {
    return createMMKV({ id: 'tunehub' });
  } catch {
    return createFallback();
  }
}

export const storage = createStore();
