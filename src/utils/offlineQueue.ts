// ====================================
// File: src/utils/offlineQueue.ts
// IndexedDB Temporary Offline Action Queue & Sync Engine
// ====================================

import { openDB, DBSchema, IDBPDatabase } from "idb";

export interface OfflineAction {
  id?: number;
  idempotencyKey: string;
  actionType: "check-in" | "break" | "resume" | "check-out" | "correction";
  payload: any;
  status: "Pending" | "Synced" | "Failed" | "Conflict";
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

interface WorkforceOfflineDB extends DBSchema {
  offlineActions: {
    key: number;
    value: OfflineAction;
    indexes: {
      "by-status": string;
      "by-idempotencyKey": string;
    };
  };
}

const DB_NAME = "WorkforceAnalyticsOfflineDB";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<WorkforceOfflineDB>> | null = null;

const getDB = (): Promise<IDBPDatabase<WorkforceOfflineDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<WorkforceOfflineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("offlineActions")) {
          const store = db.createObjectStore("offlineActions", {
            keyPath: "id",
            autoIncrement: true,
          });
          store.createIndex("by-status", "status");
          store.createIndex("by-idempotencyKey", "idempotencyKey", { unique: true });
        }
      },
    });
  }
  return dbPromise;
};

// Generate UUID for idempotency key
export const generateIdempotencyKey = (): string => {
  return "idem_" + Date.now() + "_" + Math.random().toString(36).substring(2, 11);
};

export const enqueueOfflineAction = async (
  actionType: OfflineAction["actionType"],
  payload: any
): Promise<OfflineAction> => {
  const db = await getDB();
  const idempotencyKey = generateIdempotencyKey();
  const action: OfflineAction = {
    idempotencyKey,
    actionType,
    payload,
    status: "Pending",
    retryCount: 0,
    maxRetries: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const id = await db.add("offlineActions", action);
  action.id = id;
  return action;
};

export const getPendingOfflineActions = async (): Promise<OfflineAction[]> => {
  const db = await getDB();
  return db.getAllFromIndex("offlineActions", "by-status", "Pending");
};

export const updateOfflineActionStatus = async (
  id: number,
  status: OfflineAction["status"],
  errorMessage?: string
): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction("offlineActions", "readwrite");
  const store = tx.objectStore("offlineActions");
  const action = await store.get(id);

  if (action) {
    action.status = status;
    action.updatedAt = new Date().toISOString();
    if (errorMessage) action.errorMessage = errorMessage;
    if (status === "Failed") action.retryCount += 1;
    await store.put(action);
  }
  await tx.done;
};

/**
 * Synchronizes pending offline actions with backend API when online
 */
export const syncOfflineQueue = async (apiCall: (action: OfflineAction) => Promise<any>): Promise<{ synced: number; failed: number }> => {
  if (!navigator.onLine) {
    return { synced: 0, failed: 0 };
  }

  const pendingActions = await getPendingOfflineActions();
  let synced = 0;
  let failed = 0;

  for (const action of pendingActions) {
    if (!action.id) continue;

    if (action.retryCount >= action.maxRetries) {
      await updateOfflineActionStatus(action.id, "Failed", "Max retries reached");
      failed++;
      continue;
    }

    try {
      // Exponential backoff wait if previously retried
      if (action.retryCount > 0) {
        const backoffMs = Math.min(1000 * Math.pow(2, action.retryCount), 30000);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }

      await apiCall(action);
      await updateOfflineActionStatus(action.id, "Synced");
      synced++;
    } catch (err: any) {
      console.error(`[Offline Sync Error] Action ${action.id} failed:`, err);
      const isConflict = err?.status === 409 || err?.message?.includes("Conflict");
      await updateOfflineActionStatus(action.id, isConflict ? "Conflict" : "Pending", err?.message || "Sync failed");
      failed++;
    }
  }

  return { synced, failed };
};

// Automatic listener when internet returns
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    console.log("[Offline Queue] Internet restored. Triggering automatic queue sync...");
    window.dispatchEvent(new CustomEvent("sync_offline_queue"));
  });
}
