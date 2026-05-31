// AP3X AnxietyCore — Check-in Service
// ─────────────────────────────────────────────────────────────────
// Handles all patient self-report writes.
// ALL writes go through BCO's emitEvent() → rule engine → action engine
// → storage.  No direct storage writes here.
//
// Data flow:
//   User input → emitEvent() → BCO pipeline → storage + sync queue

import { emitEvent } from "../../../bco/core/events.js";
import { storage }   from "../../../bco/core/storage.js";
import { AP3X_KEYS } from "../../shared/constants.js";
import { evaluateAnxietyEntry, evaluateAnxietyTrend }
  from "../engine/rules-engine.js";
import { updateStreak } from "./streak-tracker.js";
import { enqueue }      from "../../shared/sync-service.js";

// ── Anxiety check-in ──────────────────────────────────────────────
/**
 * submitAnxietyCheckin({ userId, anxiety_score, note, sleep_hours })
 * Validates input, writes locally, queues sync, returns rule feedback.
 */
export function submitAnxietyCheckin({ userId, anxiety_score, note = "", sleep_hours }) {
  if (anxiety_score < 0 || anxiety_score > 10) {
    throw new Error("anxiety_score must be 0–10.");
  }

  const record = {
    id:            crypto.randomUUID(),
    user_id:       userId,
    anxiety_score,
    note,
    sleep_hours:   sleep_hours ?? null,
    created_at:    new Date().toISOString()
  };

  // Write locally via BCO event pipeline
  emitEvent("AP3X_LOG_ANXIETY", "anxietycore", { ...record, userId });

  // Append to local SSOT log
  storage.update(AP3X_KEYS.ANXIETY_LOGS, (logs) => {
    const l = logs || [];
    l.unshift(record);          // newest first
    return l.slice(0, 500);     // keep last 500 entries per device
  });

  // Queue for backend sync
  enqueue("anxiety_logs", record);

  // Streak
  const streak = updateStreak(userId);

  // Immediate rule feedback
  const recentLogs  = (storage.get(AP3X_KEYS.ANXIETY_LOGS) || [])
    .filter((e) => e.user_id === userId);
  const entryResult = evaluateAnxietyEntry(record);
  const trendResult = evaluateAnxietyTrend(recentLogs);

  return { record, streak, entryResult, trendResult };
}

// ── Mood log ──────────────────────────────────────────────────────
/**
 * submitMoodLog({ userId, mood_text, tags })
 * tags: string[] e.g. ["work", "tired", "social"]
 */
export function submitMoodLog({ userId, mood_text, tags = [] }) {
  const record = {
    id:         crypto.randomUUID(),
    user_id:    userId,
    mood_text,
    tags,
    created_at: new Date().toISOString()
  };

  emitEvent("AP3X_LOG_MOOD", "anxietycore", { userId, ...record });

  storage.update(AP3X_KEYS.MOOD_LOGS, (logs) => {
    const l = logs || [];
    l.unshift(record);
    return l.slice(0, 500);
  });

  enqueue("mood_logs", record);
  return record;
}

// ── Sleep log ─────────────────────────────────────────────────────
/**
 * submitSleepLog({ userId, hours, quality, note })
 * quality: 1–5
 */
export function submitSleepLog({ userId, hours, quality = null, note = "" }) {
  const record = {
    id:         crypto.randomUUID(),
    user_id:    userId,
    hours,
    quality,
    note,
    created_at: new Date().toISOString()
  };

  emitEvent("AP3X_LOG_SLEEP", "anxietycore", { userId, ...record });

  storage.update(AP3X_KEYS.SLEEP_LOGS, (logs) => {
    const l = logs || [];
    l.unshift(record);
    return l.slice(0, 500);
  });

  enqueue("sleep_logs", record);
  return record;
}

// ── Trigger log ───────────────────────────────────────────────────
/**
 * submitTriggerLog({ userId, trigger_name, description, severity })
 * severity: 1–10
 */
export function submitTriggerLog({ userId, trigger_name, description = "", severity = 5 }) {
  const record = {
    id:            crypto.randomUUID(),
    user_id:       userId,
    trigger_name,
    description,
    severity,
    created_at:    new Date().toISOString()
  };

  emitEvent("AP3X_LOG_TRIGGER", "anxietycore", { userId, ...record });

  storage.update(AP3X_KEYS.TRIGGER_LOGS, (logs) => {
    const l = logs || [];
    l.unshift(record);
    return l.slice(0, 200);
  });

  enqueue("triggers", record);
  return record;
}

// ── Read helpers (for Patient PWA UI) ─────────────────────────────
export function getAnxietyHistory(userId, limit = 30) {
  return (storage.get(AP3X_KEYS.ANXIETY_LOGS) || [])
    .filter((e) => e.user_id === userId)
    .slice(0, limit);
}

export function getMoodHistory(userId, limit = 30) {
  return (storage.get(AP3X_KEYS.MOOD_LOGS) || [])
    .filter((e) => e.user_id === userId)
    .slice(0, limit);
}

export function getSleepHistory(userId, limit = 30) {
  return (storage.get(AP3X_KEYS.SLEEP_LOGS) || [])
    .filter((e) => e.user_id === userId)
    .slice(0, limit);
}
