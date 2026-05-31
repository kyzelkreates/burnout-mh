// AP3X AnxietyCore — Rules Engine
// ─────────────────────────────────────────────────────────────────
// Lightweight, pure-function rule evaluator.
// Plugs into BCO's existing rule system via module registration
// (see anxietycore.module.js) AND can be called directly from the
// Patient PWA for instant local feedback.
//
// Architecture contract (BCO Run 2):
//   Rules evaluate before every action. Rule engine has authority.
//   This file is non-destructive — it RETURNS results, never writes.

import { THRESHOLDS, RISK_LEVELS } from "../../shared/constants.js";

// ─────────────────────────────────────────────────────────────────
// SINGLE-ENTRY RULES
// Called after each individual check-in submission.
// ─────────────────────────────────────────────────────────────────

/**
 * evaluateAnxietyEntry(entry)
 * @param {{ anxiety_score: number, sleep_hours: number, user_id: string }}
 * @returns {{ risk: string, suggestions: string[], flags: string[] }}
 */
export function evaluateAnxietyEntry(entry) {
  const { anxiety_score, sleep_hours } = entry;
  const suggestions = [];
  const flags = [];
  let risk = RISK_LEVELS.LOW;

  // Rule 1: Single high score
  if (anxiety_score >= THRESHOLDS.ANXIETY_HIGH) {
    risk = RISK_LEVELS.HIGH;
    flags.push("HIGH_SINGLE_SCORE");
    suggestions.push("Try a breathing or grounding exercise now.");
  }

  // Rule 2: Low sleep + elevated anxiety
  if (
    sleep_hours !== undefined &&
    sleep_hours < THRESHOLDS.SLEEP_LOW_HOURS &&
    anxiety_score > THRESHOLDS.ANXIETY_SLEEP_COMBO
  ) {
    risk = RISK_LEVELS.HIGH;
    flags.push("LOW_SLEEP_HIGH_ANXIETY");
    suggestions.push("Your sleep was low. Consider a recovery rest period today.");
  }

  return { risk, suggestions, flags };
}

// ─────────────────────────────────────────────────────────────────
// TREND-BASED RULES
// Require a history array. Called after each entry is stored.
// ─────────────────────────────────────────────────────────────────

/**
 * evaluateAnxietyTrend(recentLogs)
 * @param {Array<{ anxiety_score: number, created_at: string }>} recentLogs
 *   Most recent entries first. Pass at least 3.
 * @returns {{ risk: string, flags: string[], suggestions: string[] }}
 */
export function evaluateAnxietyTrend(recentLogs) {
  const flags = [];
  const suggestions = [];
  let risk = RISK_LEVELS.LOW;

  if (!recentLogs || recentLogs.length < THRESHOLDS.ANXIETY_MEDIUM_COUNT) {
    return { risk, flags, suggestions };
  }

  // Rule 3: 3 consecutive entries ≥ MEDIUM threshold
  const lastN = recentLogs.slice(0, THRESHOLDS.ANXIETY_MEDIUM_COUNT);
  const allMedium = lastN.every(
    (e) => e.anxiety_score >= THRESHOLDS.ANXIETY_MEDIUM_RUN
  );

  if (allMedium) {
    risk = RISK_LEVELS.MEDIUM;
    flags.push("CONSECUTIVE_MEDIUM_SCORES");
    suggestions.push("You've had elevated anxiety for several days. A clinician review has been flagged.");
  }

  return { risk, flags, suggestions };
}

// ─────────────────────────────────────────────────────────────────
// MISSING DATA RULE
// Called by the clinician dashboard risk aggregator, not the PWA.
// ─────────────────────────────────────────────────────────────────

/**
 * evaluateMissingData(lastCheckinISO)
 * @param {string | null} lastCheckinISO — ISO timestamp of last entry
 * @returns {{ risk: string, flags: string[] }}
 */
export function evaluateMissingData(lastCheckinISO) {
  if (!lastCheckinISO) {
    return { risk: RISK_LEVELS.MISSING, flags: ["NO_DATA"] };
  }

  const hoursSince =
    (Date.now() - new Date(lastCheckinISO).getTime()) / 3_600_000;

  if (hoursSince >= THRESHOLDS.MISSING_DATA_HOURS) {
    return { risk: RISK_LEVELS.MISSING, flags: ["MISSING_DATA"] };
  }

  return { risk: RISK_LEVELS.LOW, flags: [] };
}

// ─────────────────────────────────────────────────────────────────
// AGGREGATE RISK RESOLVER
// Combines entry, trend, and missing-data results into one verdict.
// ─────────────────────────────────────────────────────────────────

const RISK_ORDER = [
  RISK_LEVELS.LOW,
  RISK_LEVELS.MEDIUM,
  RISK_LEVELS.HIGH,
  RISK_LEVELS.CRITICAL,
  RISK_LEVELS.MISSING
];

/**
 * resolveAggregateRisk(...results)
 * Returns the highest risk level from multiple rule results.
 */
export function resolveAggregateRisk(...results) {
  let highest = RISK_LEVELS.LOW;
  for (const r of results) {
    if (r && r.risk) {
      const a = RISK_ORDER.indexOf(r.risk);
      const b = RISK_ORDER.indexOf(highest);
      if (a > b) highest = r.risk;
    }
  }
  return highest;
}
