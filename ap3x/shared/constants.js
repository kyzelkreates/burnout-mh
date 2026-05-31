// AP3X AnxietyCore — Shared Constants
// ─────────────────────────────────────────────────────────────────
// Single definition of keys, thresholds, and role names shared
// across the Patient PWA and Clinician Dashboard.
// NEVER import from bco/core/storage.js directly — use events.

// ── Roles ────────────────────────────────────────────────────────
export const AP3X_ROLES = {
  PATIENT:   "patient",
  CLINICIAN: "clinician"
};

// ── SSOT storage keys (prefixed to avoid BCO collisions) ─────────
export const AP3X_KEYS = {
  ANXIETY_LOGS:  "ap3x_anxiety_logs",
  MOOD_LOGS:     "ap3x_mood_logs",
  SLEEP_LOGS:    "ap3x_sleep_logs",
  TRIGGER_LOGS:  "ap3x_trigger_logs",
  RISK_FLAGS:    "ap3x_risk_flags",
  USER_PROFILE:  "ap3x_user_profile",
  STREAK:        "ap3x_streak",
  SYNC_QUEUE:    "ap3x_sync_queue",
  CLINICIAN_NOTES: "ap3x_clinician_notes"
};

// ── Risk levels ───────────────────────────────────────────────────
export const RISK_LEVELS = {
  LOW:      "LOW",
  MEDIUM:   "MEDIUM",
  HIGH:     "HIGH",
  CRITICAL: "CRITICAL",
  MISSING:  "MISSING_DATA"
};

// ── Rule thresholds ───────────────────────────────────────────────
export const THRESHOLDS = {
  ANXIETY_HIGH:          8,    // single score → HIGH
  ANXIETY_MEDIUM_RUN:    6,    // 3 consecutive ≥ this → MEDIUM
  ANXIETY_MEDIUM_COUNT:  3,    // consecutive entries
  SLEEP_LOW_HOURS:       4,    // sleep < this
  ANXIETY_SLEEP_COMBO:   6,    // anxiety > this + low sleep → HIGH
  MISSING_DATA_HOURS:   48     // no check-in in this many hours → MISSING
};

// ── Disclaimer (required in all UI footers) ───────────────────────
export const DISCLAIMER =
  "AP3X AnxietyCore is a monitoring tool only. " +
  "It is NOT a medical device and does NOT provide medical diagnoses. " +
  "All outputs are informational. Always consult a qualified clinician.";
