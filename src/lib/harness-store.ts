import { openDB, type IDBPDatabase } from "idb";
import { STORAGE_KEYS } from "./constants";
import { parseCustomHarnessStore } from "./builder-validation";
import type { CustomHarness, CustomHarnessStore } from "./custom-harness-types";

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface HarnessStore {
  readonly getAll: () => Promise<ReadonlyArray<CustomHarness>>;
  readonly put: (harness: CustomHarness) => Promise<void>;
  readonly remove: (id: string) => Promise<void>;
  readonly subscribe: (cb: () => void) => () => void;
  readonly close: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DB_NAME = "harness100";
const DB_VERSION = 1;
const STORE_NAME = "custom_harnesses";
const CHANNEL_NAME = "harness100_sync";

// ---------------------------------------------------------------------------
// BroadcastChannel helper (SSR-safe)
// ---------------------------------------------------------------------------

interface SyncChannel {
  readonly notify: () => void;
  readonly onSync: (cb: () => void) => () => void;
  readonly close: () => void;
}

function createSyncChannel(): SyncChannel {
  if (typeof BroadcastChannel === "undefined") {
    return { notify: () => {}, onSync: () => () => {}, close: () => {} };
  }

  const channel = new BroadcastChannel(CHANNEL_NAME);
  return {
    notify: () => channel.postMessage("sync"),
    onSync: (cb: () => void) => {
      const handler = () => cb();
      channel.addEventListener("message", handler);
      return () => channel.removeEventListener("message", handler);
    },
    close: () => channel.close(),
  };
}

// ---------------------------------------------------------------------------
// IndexedDB implementation
// ---------------------------------------------------------------------------

async function createIdbStore(): Promise<HarnessStore> {
  const db: IDBPDatabase = await openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });

  // Migrate existing localStorage data on first load
  await migrateFromLocalStorage(db);

  const channel = createSyncChannel();

  return {
    getAll: async () => {
      const all = await db.getAll(STORE_NAME);
      return all as ReadonlyArray<CustomHarness>;
    },

    put: async (harness: CustomHarness) => {
      await db.put(STORE_NAME, harness);
      channel.notify();
    },

    remove: async (id: string) => {
      await db.delete(STORE_NAME, id);
      channel.notify();
    },

    subscribe: (cb: () => void) => channel.onSync(cb),

    close: () => {
      channel.close();
      db.close();
    },
  };
}

async function migrateFromLocalStorage(db: IDBPDatabase): Promise<void> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.customHarnesses);
    if (!raw) return;

    const store: CustomHarnessStore = parseCustomHarnessStore(raw);
    if (store.harnesses.length === 0) {
      localStorage.removeItem(STORAGE_KEYS.customHarnesses);
      return;
    }

    const tx = db.transaction(STORE_NAME, "readwrite");
    for (const harness of store.harnesses) {
      tx.store.put(harness);
    }
    await tx.done;

    localStorage.removeItem(STORAGE_KEYS.customHarnesses);
  } catch {
    // Migration is best-effort; localStorage data stays if it fails
  }
}

// ---------------------------------------------------------------------------
// localStorage fallback (private browsing, etc.)
// ---------------------------------------------------------------------------

function createLocalStorageFallback(): HarnessStore {
  const channel = createSyncChannel();

  function readAll(): ReadonlyArray<CustomHarness> {
    const raw = localStorage.getItem(STORAGE_KEYS.customHarnesses);
    return parseCustomHarnessStore(raw).harnesses;
  }

  function writeAll(harnesses: ReadonlyArray<CustomHarness>): void {
    const store: CustomHarnessStore = { version: 1, harnesses };
    localStorage.setItem(STORAGE_KEYS.customHarnesses, JSON.stringify(store));
  }

  return {
    getAll: async () => readAll(),

    put: async (harness: CustomHarness) => {
      const all = readAll();
      const idx = all.findIndex((h) => h.id === harness.id);
      const next = idx >= 0
        ? all.map((h, i) => (i === idx ? harness : h))
        : [...all, harness];
      writeAll(next);
      channel.notify();
    },

    remove: async (id: string) => {
      writeAll(readAll().filter((h) => h.id !== id));
      channel.notify();
    },

    subscribe: (cb: () => void) => {
      // Use both BroadcastChannel and StorageEvent for fallback path
      const unsubChannel = channel.onSync(cb);
      const handler = (e: StorageEvent) => {
        if (e.key === STORAGE_KEYS.customHarnesses) cb();
      };
      window.addEventListener("storage", handler);
      return () => {
        unsubChannel();
        window.removeEventListener("storage", handler);
      };
    },

    close: () => channel.close(),
  };
}

// ---------------------------------------------------------------------------
// Factory (singleton, SSR-safe)
// ---------------------------------------------------------------------------

let storePromise: Promise<HarnessStore> | null = null;

export function getHarnessStore(): Promise<HarnessStore> {
  if (storePromise) return storePromise;

  storePromise = createIdbStore().catch(() => createLocalStorageFallback());
  return storePromise;
}

/** Reset the singleton — only used in tests. */
export function resetHarnessStore(): void {
  storePromise = null;
}

/** Exposed for testing — creates a localStorage-backed store. */
export function createLocalStorageFallbackForTest(): HarnessStore {
  return createLocalStorageFallback();
}
