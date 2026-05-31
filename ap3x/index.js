// AP3X AnxietyCore — System Entry Point
// ─────────────────────────────────────────────────────────────────
// Single import barrel for the full AP3X layer.
// Wires Supabase client into all modules that need it.
// Does NOT reinitialise BCO Core — assumes BCO is already booted.
//
// Usage (Patient PWA):
//   import { initAP3X } from './ap3x/index.js';
//   await initAP3X({ mode: 'patient', supabaseUrl: '…', supabaseKey: '…' });
//
// Usage (Clinician Dashboard):
//   import { initAP3X } from './ap3x/index.js';
//   await initAP3X({ mode: 'clinician', supabaseUrl: '…', supabaseKey: '…' });

// ── Supabase credentials ──────────────────────────────────────────
// Replace with your project values (or inject via env at build time)
const SUPABASE_URL      = "";   // e.g. "https://xxxx.supabase.co"
const SUPABASE_ANON_KEY = "";   // your public anon key

// ── Module exports ────────────────────────────────────────────────

// Engine
export { evaluateAnxietyEntry, evaluateAnxietyTrend,
         evaluateMissingData, resolveAggregateRisk }
  from "./anxietycore/engine/rules-engine.js";

// Check-in service (Patient PWA)
export { submitAnxietyCheckin, submitMoodLog, submitSleepLog,
         submitTriggerLog, getAnxietyHistory, getMoodHistory,
         getSleepHistory }
  from "./anxietycore/module/checkin-service.js";

// Streak
export { getStreak, updateStreak }
  from "./anxietycore/module/streak-tracker.js";

// BCO module manifest
export { anxietyCoreModule }
  from "./anxietycore/module/anxietycore.module.js";

// Sync service
export { enqueue, flushQueue, attachNetworkListener, getPendingCount }
  from "./shared/sync-service.js";

// Risk aggregator (Clinician Dashboard)
export { fetchPatientSummaries, subscribeToPatientUpdates,
         saveClinicianNote, fetchClinicianNotes }
  from "./clinician-dashboard/risk-aggregator.js";

// Constants
export { AP3X_KEYS, AP3X_ROLES, RISK_LEVELS, THRESHOLDS, DISCLAIMER }
  from "./shared/constants.js";

// ── initAP3X ─────────────────────────────────────────────────────
/**
 * initAP3X({ mode, supabaseUrl?, supabaseKey? })
 * Bootstraps the AP3X layer on top of an already-running BCO instance.
 *
 * @param {{ mode: 'patient'|'clinician', supabaseUrl?: string, supabaseKey?: string }}
 */
export async function initAP3X({
  mode,
  supabaseUrl  = SUPABASE_URL,
  supabaseKey  = SUPABASE_ANON_KEY
} = {}) {
  // 1. Create Supabase client if credentials provided
  let supabaseClient = null;

  if (supabaseUrl && supabaseKey) {
    // Dynamic import — Supabase JS v2 via CDN or bundler
    const { createClient } = await import(
      "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
    );
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }

  // 2. Inject Supabase client into modules that need it
  if (supabaseClient) {
    const { injectSupabaseClient: injectSync } = await import("./shared/sync-service.js");
    const { injectSupabaseClient: injectRisk } = await import("./clinician-dashboard/risk-aggregator.js");
    injectSync(supabaseClient);
    injectRisk(supabaseClient);
    console.log("[AP3X] Supabase client injected.");
  } else {
    console.warn("[AP3X] No Supabase credentials — running in local-only mode.");
  }

  // 3. Mode-specific init
  if (mode === "patient") {
    const { attachNetworkListener } = await import("./shared/sync-service.js");
    attachNetworkListener();
    console.log("[AP3X] Patient mode initialised.");
  }

  if (mode === "clinician") {
    console.log("[AP3X] Clinician mode initialised.");
  }

  return { supabaseClient };
}
