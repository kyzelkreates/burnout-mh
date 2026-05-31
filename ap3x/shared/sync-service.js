// AP3X AnxietyCore — Sync Service
// ─────────────────────────────────────────────────────────────────
// Manages the local-first → backend sync flow.
// Architecture contract: data writes go local first (SSOT via BCO
// storage adapter), then are queued and flushed to Supabase when
// the network is available.
//
// Data flow:
//   Patient PWA → local storage → SyncService → Supabase backend
//
// Clinician dashboard NEVER calls this — it reads Supabase directly.

import { storage } from "../../bco/core/storage.js";
import { AP3X_KEYS } from "./constants.js";
import { rawLog } from "../../bco/core/storage.js";

// ── Supabase client (injected at boot — see ap3x/index.js) ───────
let _supabase = null;

export function injectSupabaseClient(client) {
  _supabase = client;
}

// ── Queue a record for sync ───────────────────────────────────────
/**
 * enqueue(table, record)
 * Adds a record to the local sync queue.
 * Called immediately after any local write.
 */
export function enqueue(table, record) {
  storage.update(AP3X_KEYS.SYNC_QUEUE, (queue) => {
    const q = queue || [];
    q.push({ table, record, queued_at: new Date().toISOString() });
    return q;
  });
}

// ── Flush queue to Supabase ───────────────────────────────────────
/**
 * flushQueue()
 * Attempts to push all queued records to Supabase.
 * Safe to call repeatedly — items are removed only on success.
 * Called automatically on online events and at PWA boot.
 */
export async function flushQueue() {
  if (!_supabase) {
    console.warn("[AP3X Sync] No Supabase client injected — skipping flush.");
    return { flushed: 0, failed: 0 };
  }

  const queue = storage.get(AP3X_KEYS.SYNC_QUEUE) || [];
  if (queue.length === 0) return { flushed: 0, failed: 0 };

  let flushed = 0;
  let failed  = 0;
  const remaining = [];

  for (const item of queue) {
    try {
      const { error } = await _supabase.from(item.table).upsert(item.record);
      if (error) throw error;
      flushed++;
    } catch (err) {
      console.warn(`[AP3X Sync] Failed to sync ${item.table}:`, err.message);
      remaining.push(item);
      failed++;
    }
  }

  storage.set(AP3X_KEYS.SYNC_QUEUE, remaining);
  rawLog("AP3X_SYNC_FLUSH", { flushed, failed }, "ANXIETYCORE");
  return { flushed, failed };
}

// ── Network listener ──────────────────────────────────────────────
/**
 * attachNetworkListener()
 * Auto-flush when the browser comes online.
 * Call once at PWA boot.
 */
export function attachNetworkListener() {
  if (typeof window === "undefined") return;
  window.addEventListener("online", () => {
    rawLog("AP3X_NETWORK_ONLINE", {}, "ANXIETYCORE");
    flushQueue().then(({ flushed }) => {
      if (flushed > 0) console.log(`[AP3X Sync] Flushed ${flushed} records on reconnect.`);
    });
  });
}

// ── Pending count (for UI badge) ──────────────────────────────────
export function getPendingCount() {
  return (storage.get(AP3X_KEYS.SYNC_QUEUE) || []).length;
}
