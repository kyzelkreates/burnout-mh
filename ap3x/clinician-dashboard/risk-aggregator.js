// AP3X AnxietyCore — Clinician Risk Aggregator
// ─────────────────────────────────────────────────────────────────
// Reads patient data from Supabase and applies the AnxietyCore rule
// engine to produce per-patient risk summaries for the dashboard.
//
// Architecture: read-only from patient tables.
// Clinicians can ONLY write to clinician_notes and risk_flags.

import {
  evaluateAnxietyEntry,
  evaluateAnxietyTrend,
  evaluateMissingData,
  resolveAggregateRisk
} from "../anxietycore/engine/rules-engine.js";
import { RISK_LEVELS } from "../shared/constants.js";

// ── Supabase client (injected at boot) ────────────────────────────
let _supabase = null;
export function injectSupabaseClient(client) { _supabase = client; }

// ── Fetch all patients with their latest data ─────────────────────
/**
 * fetchPatientSummaries(clinicianId)
 * Returns array of PatientSummary objects for the clinician's patients.
 */
export async function fetchPatientSummaries(clinicianId) {
  if (!_supabase) return _mockPatients();

  // Fetch patient profiles assigned to this clinician
  const { data: profiles, error: pErr } = await _supabase
    .from("patient_profiles")
    .select("*")
    .eq("clinician_id", clinicianId);

  if (pErr) {
    console.error("[AP3X] Patient profiles fetch error:", pErr.message);
    return [];
  }

  // For each patient, fetch latest anxiety logs
  const summaries = await Promise.all(
    profiles.map((patient) => _buildPatientSummary(patient))
  );

  return summaries;
}

async function _buildPatientSummary(patient) {
  const userId = patient.user_id;

  // Latest 10 anxiety logs
  const { data: anxietyLogs } = await _supabase
    .from("anxiety_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  const logs   = anxietyLogs || [];
  const latest = logs[0] || null;

  // Sleep logs (last 1)
  const { data: sleepLogs } = await _supabase
    .from("sleep_logs")
    .select("hours")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  const lastSleep = sleepLogs?.[0]?.hours ?? undefined;

  // Risk evaluation
  const entryResult  = latest
    ? evaluateAnxietyEntry({ ...latest, sleep_hours: lastSleep })
    : { risk: RISK_LEVELS.LOW, flags: [], suggestions: [] };

  const trendResult  = evaluateAnxietyTrend(logs);
  const missingResult = evaluateMissingData(latest?.created_at ?? null);
  const finalRisk    = resolveAggregateRisk(entryResult, trendResult, missingResult);

  // Collect all flags
  const allFlags = [
    ...entryResult.flags,
    ...trendResult.flags,
    ...missingResult.flags
  ];

  // Trend direction (compare latest 2 entries)
  let trend = "flat";
  if (logs.length >= 2) {
    const diff = logs[0].anxiety_score - logs[1].anxiety_score;
    if (diff >= 2)      trend = "up";
    else if (diff <= -2) trend = "down";
  }

  return {
    user_id:        userId,
    name:           patient.display_name || `Patient ${userId.slice(0, 6)}`,
    latest_score:   latest?.anxiety_score ?? null,
    last_checkin:   latest?.created_at ?? null,
    risk:           finalRisk,
    flags:          allFlags,
    trend,
    logs:           logs.slice(0, 30).reverse(), // oldest first for chart
    sleep_hours:    lastSleep ?? null
  };
}

// ── Clinician writes (notes + flags only) ─────────────────────────
/**
 * saveClinicianNote({ patientUserId, clinicianId, noteText, followUpStatus })
 */
export async function saveClinicianNote({
  patientUserId, clinicianId, noteText, followUpStatus = null
}) {
  if (!_supabase) {
    console.log("[AP3X] Mock save note:", noteText);
    return { success: true };
  }

  const { error } = await _supabase
    .from("clinician_notes")
    .insert({
      id:              crypto.randomUUID(),
      patient_user_id: patientUserId,
      clinician_id:    clinicianId,
      note_text:       noteText,
      follow_up_status: followUpStatus,
      created_at:      new Date().toISOString()
    });

  if (error) {
    console.error("[AP3X] Note save error:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * fetchClinicianNotes(patientUserId)
 */
export async function fetchClinicianNotes(patientUserId) {
  if (!_supabase) return [];

  const { data, error } = await _supabase
    .from("clinician_notes")
    .select("*")
    .eq("patient_user_id", patientUserId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return [];
  return data || [];
}

// ── Supabase realtime subscription ───────────────────────────────
/**
 * subscribeToPatientUpdates(clinicianId, onUpdate)
 * Calls onUpdate() whenever anxiety_logs table changes.
 * Returns unsubscribe function.
 */
export function subscribeToPatientUpdates(clinicianId, onUpdate) {
  if (!_supabase) {
    // Polling fallback
    const interval = setInterval(onUpdate, 30_000);
    return () => clearInterval(interval);
  }

  const channel = _supabase
    .channel("ap3x-anxiety-realtime")
    .on("postgres_changes", {
      event:  "*",
      schema: "public",
      table:  "anxiety_logs"
    }, () => onUpdate())
    .subscribe();

  return () => _supabase.removeChannel(channel);
}

// ── Mock data (no Supabase connected) ────────────────────────────
function _mockPatients() {
  const now = new Date();
  const daysAgo = (n) => new Date(now - n * 86_400_000).toISOString();

  return [
    {
      user_id: "mock-001",
      name: "Alex T.",
      latest_score: 9,
      last_checkin: daysAgo(0.3),
      risk: RISK_LEVELS.HIGH,
      flags: ["HIGH_SINGLE_SCORE"],
      trend: "up",
      logs: [5,6,7,8,9].map((s, i) => ({ anxiety_score: s, created_at: daysAgo(4 - i) })),
      sleep_hours: 3
    },
    {
      user_id: "mock-002",
      name: "Jordan M.",
      latest_score: 6,
      last_checkin: daysAgo(0.8),
      risk: RISK_LEVELS.MEDIUM,
      flags: ["CONSECUTIVE_MEDIUM_SCORES"],
      trend: "flat",
      logs: [6,7,6,6,6].map((s, i) => ({ anxiety_score: s, created_at: daysAgo(4 - i) })),
      sleep_hours: 6
    },
    {
      user_id: "mock-003",
      name: "Sam R.",
      latest_score: 3,
      last_checkin: daysAgo(1),
      risk: RISK_LEVELS.LOW,
      flags: [],
      trend: "down",
      logs: [8,7,5,4,3].map((s, i) => ({ anxiety_score: s, created_at: daysAgo(4 - i) })),
      sleep_hours: 7
    },
    {
      user_id: "mock-004",
      name: "Casey L.",
      latest_score: null,
      last_checkin: null,
      risk: RISK_LEVELS.MISSING,
      flags: ["NO_DATA"],
      trend: "flat",
      logs: [],
      sleep_hours: null
    },
    {
      user_id: "mock-005",
      name: "River K.",
      latest_score: 8,
      last_checkin: daysAgo(0.1),
      risk: RISK_LEVELS.HIGH,
      flags: ["HIGH_SINGLE_SCORE", "LOW_SLEEP_HIGH_ANXIETY"],
      trend: "up",
      logs: [4,5,6,7,8].map((s, i) => ({ anxiety_score: s, created_at: daysAgo(4 - i) })),
      sleep_hours: 2
    }
  ];
}
