import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import {
  persistQueryClientSubscribe,
  type PersistedClient,
} from '@tanstack/query-persist-client-core';
import { focusManager, hydrate, QueryClient } from '@tanstack/react-query';
import { AppState } from 'react-native';
import { createMMKV } from 'react-native-mmkv';

import { appVersion, runningOtaVersion } from '@/services/ota';

const CACHE_KEY = 'query-cache';
export const PERSIST_MAX_AGE = 24 * 60 * 60_000;
// Each binary and OTA bundle starts empty, so a bundle never reads data shaped by another one.
const BUSTER = `${appVersion}+${runningOtaVersion ?? 'embedded'}`;
// Only the home sections are saved: a cold start shows home at once, even offline.
const PERSISTED_ROOTS = new Set<unknown>(['home']);

// Its own instance, so dropping the cache never touches likes, history or settings.
const storage = createMMKV({ id: 'query-cache' });

export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 5 * 60_000 } },
});

// Restored synchronously so the first render already has the data; the library's async restore
// renders every persisted query as pending first.
function restoreCache() {
  const raw = storage.getString(CACHE_KEY);
  if (!raw) return;
  try {
    const saved = JSON.parse(raw) as PersistedClient;
    if (saved.buster === BUSTER && Date.now() - saved.timestamp < PERSIST_MAX_AGE) {
      hydrate(queryClient, saved.clientState);
      return;
    }
  } catch {
    // Unreadable cache: dropped below.
  }
  storage.remove(CACHE_KEY);
}

restoreCache();

persistQueryClientSubscribe({
  queryClient,
  buster: BUSTER,
  persister: createAsyncStoragePersister({
    key: CACHE_KEY,
    storage: {
      getItem: (key) => storage.getString(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => {
        storage.remove(key);
      },
    },
  }),
  dehydrateOptions: {
    shouldDehydrateQuery: (query) =>
      query.state.status === 'success' && PERSISTED_ROOTS.has(query.queryKey[0]),
  },
});

focusManager.setEventListener((setFocused) => {
  const subscription = AppState.addEventListener('change', (state) =>
    setFocused(state === 'active'),
  );
  return () => subscription.remove();
});
