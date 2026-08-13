export interface OfflineAction {
  id: string;
  idempotencyKey: string;
  url: string;
  method: "POST" | "PATCH" | "PUT";
  body: Record<string, unknown>;
  status: "Pending" | "Synced" | "Failed" | "Conflict";
  retryCount: number;
  createdAt: string;
  error?: string;
}

const DB_NAME = "WorkforceOfflineDB";
const STORE_NAME = "offline_actions";
const DB_VERSION = 1;

export function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not supported in this environment."));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("idempotencyKey", "idempotencyKey", { unique: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function enqueueOfflineAction(
  url: string,
  method: "POST" | "PATCH" | "PUT",
  body: Record<string, unknown>
): Promise<OfflineAction> {
  const db = await openIndexedDB();
  const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const action: OfflineAction = {
    id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    idempotencyKey,
    url,
    method,
    body: { ...body, idempotencyKey },
    status: "Pending",
    retryCount: 0,
    createdAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.add(action);

    request.onsuccess = () => resolve(action);
    request.onerror = () => reject(request.error);
  });
}

export async function getPendingOfflineActions(): Promise<OfflineAction[]> {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("status");
    const request = index.getAll("Pending");

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function updateOfflineActionStatus(
  id: string,
  status: OfflineAction["status"],
  error?: string
): Promise<void> {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const action = getReq.result as OfflineAction;
      if (action) {
        action.status = status;
        action.retryCount += 1;
        if (error) action.error = error;
        store.put(action);
      }
      resolve();
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function syncOfflineQueue(): Promise<number> {
  const pendingActions = await getPendingOfflineActions();
  let syncedCount = 0;

  for (const action of pendingActions) {
    if (action.retryCount >= 5) {
      await updateOfflineActionStatus(action.id, "Failed", "Max retry count reached.");
      continue;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(action.url, {
        method: action.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(action.body),
      });

      if (res.ok) {
        await updateOfflineActionStatus(action.id, "Synced");
        syncedCount++;
      } else if (res.status === 409) {
        await updateOfflineActionStatus(action.id, "Conflict", "Concurrent request conflict.");
      } else {
        await updateOfflineActionStatus(action.id, "Pending", `HTTP ${res.status}`);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await updateOfflineActionStatus(action.id, "Pending", errorMessage);
    }
  }

  if (syncedCount > 0 && typeof window !== "undefined") {
    window.dispatchEvent(new Event("offline_sync_complete"));
  }
  return syncedCount;
}

// Auto-sync listener on window online event
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    console.log("[IndexedDB] Network online. Flushing offline action queue...");
    syncOfflineQueue().catch(console.error);
  });
}
