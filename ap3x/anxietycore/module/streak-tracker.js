// AP3X AnxietyCore — Streak Tracker
// ─────────────────────────────────────────────────────────────────
// Pure-function streak logic. Reads/writes through BCO storage.
// Architecture: no direct localStorage calls — uses storage adapter.

import { storage } from "../../../bco/core/storage.js";
import { AP3X_KEYS } from "../../shared/constants.js";

/**
 * getStreak(userId)
 * Returns the current check-in streak for a user.
 */
export function getStreak(userId) {
  const streaks = storage.get(AP3X_KEYS.STREAK) || {};
  return streaks[userId] || { current: 0, longest: 0, last_checkin_date: null };
}

/**
 * updateStreak(userId)
 * Called after a successful daily check-in.
 * Increments streak if checked in on consecutive calendar days,
 * resets to 1 otherwise.
 * Returns the updated streak record.
 */
export function updateStreak(userId) {
  const today = _todayISO();
  const streaks = storage.get(AP3X_KEYS.STREAK) || {};
  const record = streaks[userId] || { current: 0, longest: 0, last_checkin_date: null };

  if (record.last_checkin_date === today) {
    // Already checked in today — no change
    return record;
  }

  const yesterday = _offsetDayISO(-1);
  const isConsecutive = record.last_checkin_date === yesterday;

  const newCurrent = isConsecutive ? record.current + 1 : 1;
  const updated = {
    current: newCurrent,
    longest: Math.max(newCurrent, record.longest),
    last_checkin_date: today
  };

  streaks[userId] = updated;
  storage.set(AP3X_KEYS.STREAK, streaks);
  return updated;
}

// ── Helpers ───────────────────────────────────────────────────────
function _todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function _offsetDayISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
