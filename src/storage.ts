import type { TourStorage } from './types';
import { warnOnce } from './dev';

/** How persistence storage was resolved. */
export type StorageType = 'mmkv' | 'async-storage' | 'memory' | 'custom';

let cached: { type: StorageType; adapter: TourStorage } | null = null;

/**
 * MMKV, both API generations:
 *  - v4: `createMMKV({ id })` factory
 *  - v2/v3: `new MMKV({ id })` class
 */
const tryMMKV = (): TourStorage | null => {
  try {
    const mod = require('react-native-mmkv');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let instance: any = null;
    if (typeof mod?.createMMKV === 'function') {
      instance = mod.createMMKV({ id: 'react-native-tour-guide' });
    } else if (typeof mod?.MMKV === 'function') {
      instance = new mod.MMKV({ id: 'react-native-tour-guide' });
    }
    if (
      instance &&
      typeof instance.getString === 'function' &&
      typeof instance.set === 'function' &&
      (typeof instance.remove === 'function' || typeof instance.delete === 'function')
    ) {
      const removeFn = (instance.remove ?? instance.delete).bind(instance);
      return {
        getItem: (key) => instance.getString(key) ?? null,
        setItem: (key, value) => {
          instance.set(key, value);
        },
        removeItem: (key) => {
          removeFn(key);
        },
      };
    }
    return null;
  } catch {
    return null;
  }
};

const tryAsyncStorage = (): TourStorage | null => {
  try {
    const mod = require('@react-native-async-storage/async-storage');
    const AsyncStorage = mod?.default ?? mod;
    if (
      AsyncStorage &&
      typeof AsyncStorage.getItem === 'function' &&
      typeof AsyncStorage.setItem === 'function' &&
      typeof AsyncStorage.removeItem === 'function'
    ) {
      return {
        getItem: (key) => AsyncStorage.getItem(key),
        setItem: (key, value) => AsyncStorage.setItem(key, value),
        removeItem: (key) => AsyncStorage.removeItem(key),
      };
    }
    return null;
  } catch {
    return null;
  }
};

/** In-memory last resort: the tour still works, persistence just doesn't survive restarts. */
const createMemoryStorage = (): TourStorage => {
  const store = new Map<string, string>();
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
  };
};

/**
 * Detect an available storage backend for tour persistence.
 * Priority: MMKV (fastest) → AsyncStorage → in-memory fallback.
 * The result is cached; the adapters are only probed once.
 */
export const detectStorage = (): { type: StorageType; adapter: TourStorage } => {
  if (cached) return cached;

  const mmkv = tryMMKV();
  if (mmkv) {
    cached = { type: 'mmkv', adapter: mmkv };
    return cached;
  }

  const asyncStorage = tryAsyncStorage();
  if (asyncStorage) {
    cached = { type: 'async-storage', adapter: asyncStorage };
    return cached;
  }

  warnOnce(
    'useTourPersistence found neither react-native-mmkv nor @react-native-async-storage/async-storage, so tour completion is only remembered until the app restarts.',
    'Install one of them, or pass your own storage adapter: useTourPersistence(myStorage).'
  );
  cached = { type: 'memory', adapter: createMemoryStorage() };
  return cached;
};

/** Test-only: clear the detection cache. */
export const __resetStorageCache = () => {
  cached = null;
};
