// AP3X AnxietyCore — Clinician Risk Aggregator
// ─────────────────────────────────────────────────────────────────
// Reads patient data from Supabase OR localStorage (offline/demo).
// Applies the AnxietyCore rule engine to produce per-patient risk
// summaries and AI insights for the clinician dashboard.
//
// Architecture: read-only from patient tables.
// Clinicians can ONLY write to clinician_notes, risk_flags, and
// ai_insights. SSOT keys from AP3X_KEYS.
//
// WIRING PATCH: _localPatients() now reads real AP3X localStorage
// data. burnoutAIEngine writes to AP3X_KEYS.AI_INSIGHTS.
// generatePatientDeliveryPackage() handles provisioning delivery.

import {
  evaluateAnxietyEntry,
  evaluateAnxietyTrend,
  evaluateMissingData,
  resolveAggregateRisk
} from "../anxietycore/engine/rules-engine.js";
import { RISK_LEVELS, AP3X_KEYS } from "../shared/constants.js";

// ── Helpers ───────────────────────────────────────────────────────
function _ls(key, def) {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : def; }
  catch { return def; }
}
function _lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {}
}

// ── Supabase client (injected at boot) ────────────────────────────
let _supabase = null;
export function injectSupabaseClient(client) { _supabase = client; }

// ── Fetch all patients with their latest data ─────────────────────
/**
 * fetchPatientSummaries(clinicianId)
 * Returns array of PatientSummary objects.
 * With Supabase: reads from DB. Without: reads from localStorage.
 */
export async function fetchPatientSummaries(clinicianId) {
  if (!_supabase) return _localPatients();

  const { data: profiles, error: pErr } = await _supabase
    .from("patient_profiles")
    .select("*")
    .eq("clinician_id", clinicianId);

  if (pErr) {
    console.error("[AP3X] Patient profiles fetch error:", pErr.message);
    return _localPatients(); // fallback to local
  }

  if (!profiles || profiles.length === 0) return _localPatients();

  const summaries = await Promise.all(
    profiles.map((patient) => _buildPatientSummary(patient))
  );
  return summaries;
}

async function _buildPatientSummary(patient) {
  const userId = patient.user_id;

  const { data: anxietyLogs } = await _supabase
    .from("anxiety_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  const logs   = anxietyLogs || [];
  const latest = logs[0] || null;

  const { data: sleepLogs } = await _supabase
    .from("sleep_logs")
    .select("hours")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  const lastSleep = sleepLogs?.[0]?.hours ?? undefined;

  const entryResult   = latest
    ? evaluateAnxietyEntry({ ...latest, sleep_hours: lastSleep })
    : { risk: RISK_LEVELS.LOW, flags: [], suggestions: [] };
  const trendResult   = evaluateAnxietyTrend(logs);
  const missingResult = evaluateMissingData(latest?.created_at ?? null);
  const finalRisk     = resolveAggregateRisk(entryResult, trendResult, missingResult);

  const allFlags = [...entryResult.flags, ...trendResult.flags, ...missingResult.flags];

  let trend = "flat";
  if (logs.length >= 2) {
    const diff = logs[0].anxiety_score - logs[1].anxiety_score;
    if (diff >= 2) trend = "up"; else if (diff <= -2) trend = "down";
  }

  return {
    user_id:      userId,
    name:         patient.display_name || `Patient ${userId.slice(0, 6)}`,
    latest_score: latest?.anxiety_score ?? null,
    last_checkin: latest?.created_at ?? null,
    risk:         finalRisk,
    flags:        allFlags,
    trend,
    logs:         logs.slice(0, 30).reverse(),
    sleep_hours:  lastSleep ?? null
  };
}

// ── Local patient reader (no Supabase) ───────────────────────────
/**
 * _localPatients()
 * WIRING PATCH: reads real provisioned patients from AP3X_KEYS.PROVISIONS
 * and merges their check-in data from AP3X_KEYS.ANXIETY_LOGS.
 * Falls back to seeded demo patients when provisions are empty.
 */
function _localPatients() {
  const provisions  = _ls(AP3X_KEYS.PROVISIONS, {});
  const anxietyLogs = _ls(AP3X_KEYS.ANXIETY_LOGS, []);
  const sleepLogs   = _ls(AP3X_KEYS.SLEEP_LOGS, []);
  const lifecycle   = _ls(AP3X_KEYS.LIFECYCLE, {});

  const provisionList = Object.values(provisions);

  // Build summary from real provisioned patients
  const realPatients = provisionList.map((prov) => {
    const patientId = prov.patientId;
    const patLogs   = anxietyLogs
      .filter((l) => l.user_id === patientId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const latest    = patLogs[0] || null;
    const lastSleep = sleepLogs
      .filter((l) => l.user_id === patientId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]?.hours ?? null;

    const entryResult   = latest
      ? evaluateAnxietyEntry({ ...latest, sleep_hours: lastSleep })
      : { risk: RISK_LEVELS.LOW, flags: [], suggestions: [] };
    const trendResult   = evaluateAnxietyTrend(patLogs);
    const missingResult = evaluateMissingData(latest?.created_at ?? null);
    const finalRisk     = resolveAggregateRisk(entryResult, trendResult, missingResult);
    const allFlags      = [...entryResult.flags, ...trendResult.flags, ...missingResult.flags];

    let trend = "flat";
    if (patLogs.length >= 2) {
      const diff = patLogs[0].anxiety_score - patLogs[1].anxiety_score;
      if (diff >= 2) trend = "up"; else if (diff <= -2) trend = "down";
    }

    const lc = lifecycle[patientId] || {};

    return {
      user_id:      patientId,
      name:         prov.name || `Patient ${patientId.slice(0, 8)}`,
      latest_score: latest?.anxiety_score ?? null,
      last_checkin: latest?.created_at ?? null,
      risk:         finalRisk,
      flags:        allFlags,
      trend,
      logs:         patLogs.slice(0, 30).reverse(),
      sleep_hours:  lastSleep,
      lifecycle:    lc
    };
  });

  if (realPatients.length > 0) return realPatients;

  // ── Demo seed (no real patients yet) ────────────────────────────
  const now = new Date();
  const daysAgo = (n) => new Date(now - n * 86_400_000).toISOString();
  return [
    {
      user_id: "demo-001", name: "Alex T.",
      latest_score: 9,    last_checkin: daysAgo(0.3),
      risk: RISK_LEVELS.HIGH, flags: ["HIGH_SINGLE_SCORE"], trend: "up",
      logs: [5,6,7,8,9].map((s, i) => ({ anxiety_score: s, created_at: daysAgo(4 - i), note: "" })),
      sleep_hours: 3,     lifecycle: { status: "active", onboardingComplete: true }
    },
    {
      user_id: "demo-002", name: "Jordan M.",
      latest_score: 6,    last_checkin: daysAgo(0.8),
      risk: RISK_LEVELS.MEDIUM, flags: ["CONSECUTIVE_MEDIUM_SCORES"], trend: "flat",
      logs: [6,7,6,6,6].map((s, i) => ({ anxiety_score: s, created_at: daysAgo(4 - i), note: "" })),
      sleep_hours: 6,     lifecycle: { status: "active", onboardingComplete: true }
    },
    {
      user_id: "demo-003", name: "Sam R.",
      latest_score: 3,    last_checkin: daysAgo(1),
      risk: RISK_LEVELS.LOW,  flags: [], trend: "down",
      logs: [8,7,5,4,3].map((s, i) => ({ anxiety_score: s, created_at: daysAgo(4 - i), note: "" })),
      sleep_hours: 7,     lifecycle: { status: "active", onboardingComplete: true }
    },
    {
      user_id: "demo-004", name: "Casey L.",
      latest_score: null, last_checkin: null,
      risk: RISK_LEVELS.MISSING, flags: ["NO_DATA"], trend: "flat",
      logs: [],           sleep_hours: null,
      lifecycle: { status: "pending", onboardingComplete: false }
    },
    {
      user_id: "demo-005", name: "River K.",
      latest_score: 8,    last_checkin: daysAgo(0.1),
      risk: RISK_LEVELS.HIGH,   flags: ["HIGH_SINGLE_SCORE", "LOW_SLEEP_HIGH_ANXIETY"], trend: "up",
      logs: [4,5,6,7,8].map((s, i) => ({ anxiety_score: s, created_at: daysAgo(4 - i), note: "" })),
      sleep_hours: 2,     lifecycle: { status: "active", onboardingComplete: true }
    }
  ];
}

// ── Burnout AI Engine ────────────────────────────────────────────
/**
 * WIRING PATCH: burnoutAIEngine
 * Generates AI insights for a patient and writes to AP3X_KEYS.AI_INSIGHTS.
 * Called: on check-in update, dashboard load, manual refresh.
 *
 * @param {object} patientSummary — from fetchPatientSummaries
 * @returns {object} insightRecord written to storage
 */
export function burnoutAIEngine(patientSummary) {
  const { user_id, latest_score, trend, logs, sleep_hours, risk, flags } = patientSummary;

  // ── Risk score (0–100) mapped from anxiety_score + modifiers ──
  let riskScore = (latest_score ?? 5) * 10;
  if (trend === "up")    riskScore = Math.min(100, riskScore + 10);
  if (trend === "down")  riskScore = Math.max(0,   riskScore - 10);
  if (sleep_hours !== null && sleep_hours < 4) riskScore = Math.min(100, riskScore + 15);
  if (risk === RISK_LEVELS.MISSING)            riskScore = 50; // unknown = moderate
  if (flags.includes("CONSECUTIVE_MEDIUM_SCORES")) riskScore = Math.min(100, riskScore + 8);

  // ── Trend history (last 7 data points) ────────────────────────
  const trendHistory = logs.slice(-7).map((l) => ({
    score: l.anxiety_score,
    date:  l.created_at
  }));

  // ── Summary string ─────────────────────────────────────────────
  let summary;
  if (risk === RISK_LEVELS.MISSING || latest_score === null) {
    summary = "No recent check-in data. Patient may need outreach — consider a welfare follow-up.";
  } else if (riskScore >= 80) {
    summary = `High burnout risk (${riskScore}/100). Score trending ${trend}. ` +
      (sleep_hours !== null && sleep_hours < 4
        ? "Critical sleep deficit alongside elevated distress. Urgent clinician review recommended. "
        : "Sustained high distress. Immediate support intervention advised. ") +
      (flags.length ? `Active flags: ${flags.join(", ")}.` : "");
  } else if (riskScore >= 55) {
    summary = `Moderate burnout risk (${riskScore}/100). Scores ${trend === "up" ? "worsening" : trend === "down" ? "improving" : "stable"}. ` +
      "Monitor closely. Consider scheduling a check-in session this week.";
  } else {
    summary = `Low burnout risk (${riskScore}/100). Scores ${trend === "down" ? "improving" : "stable"}. ` +
      "Continue current support. Next routine review as scheduled.";
  }

  const insightRecord = {
    patientId:    user_id,
    riskScore,
    trendHistory,
    summary,
    lastUpdated:  new Date().toISOString()
  };

  // ── Write to SSOT ─────────────────────────────────────────────
  const insights = _ls(AP3X_KEYS.AI_INSIGHTS, {});
  insights[user_id] = insightRecord;
  _lsSet(AP3X_KEYS.AI_INSIGHTS, insights);

  return insightRecord;
}

/**
 * getAIInsight(patientId)
 * Read AI insight for a patient from SSOT.
 */
export function getAIInsight(patientId) {
  const insights = _ls(AP3X_KEYS.AI_INSIGHTS, {});
  return insights[patientId] || null;
}

// ── Patient provisioning ─────────────────────────────────────────
/**
 * WIRING PATCH: provisionPatient({ name, clinicianId, baseUrl })
 * Creates a new provisioned patient, writes to AP3X_KEYS.PROVISIONS
 * and AP3X_KEYS.LIFECYCLE.
 * Returns the provision record including accessToken and delivery URL.
 */
export function provisionPatient({ name, clinicianId = "local", baseUrl = window.location.origin }) {
  const patientId   = "p_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  const accessToken = crypto.randomUUID().replace(/-/g, "");

  const provision = {
    patientId,
    name:        name || "New Patient",
    clinicianId,
    accessToken,
    createdAt:   new Date().toISOString(),
    deliveryUrl: `${baseUrl}/ap3x/patient-pwa/index.html?patientId=${patientId}&token=${accessToken}`,
    onboardingState: {
      step:      "awaiting_first_checkin",
      startedAt: null,
      completedAt: null
    }
  };

  // Write provision to SSOT
  const provisions = _ls(AP3X_KEYS.PROVISIONS, {});
  provisions[patientId] = provision;
  _lsSet(AP3X_KEYS.PROVISIONS, provisions);

  // Write lifecycle to SSOT
  const lifecycle = _ls(AP3X_KEYS.LIFECYCLE, {});
  lifecycle[patientId] = {
    status:             "pending",
    deployedAt:         new Date().toISOString(),
    lastSync:           null,
    onboardingComplete: false
  };
  _lsSet(AP3X_KEYS.LIFECYCLE, lifecycle);

  return provision;
}

/**
 * WIRING PATCH: generatePatientDeliveryPackage(patientId)
 * Reads an existing provision and returns the full delivery package.
 * Returns null if patientId not found.
 */
export function generatePatientDeliveryPackage(patientId) {
  const provisions = _ls(AP3X_KEYS.PROVISIONS, {});
  const prov = provisions[patientId];
  if (!prov) return null;

  return {
    patientId:       prov.patientId,
    deliveryUrl:     prov.deliveryUrl,
    qrPayload:       prov.deliveryUrl,   // QR encodes the delivery URL
    accessToken:     prov.accessToken,
    onboardingState: prov.onboardingState,
    shareLink:       prov.deliveryUrl,
    createdAt:       prov.createdAt
  };
}

/**
 * updateLifecycle(patientId, fields)
 * Partial update to lifecycle record.
 */
export function updateLifecycle(patientId, fields) {
  const lifecycle = _ls(AP3X_KEYS.LIFECYCLE, {});
  lifecycle[patientId] = { ...(lifecycle[patientId] || {}), ...fields };
  _lsSet(AP3X_KEYS.LIFECYCLE, lifecycle);
}

// ── Clinician writes (notes + flags only) ─────────────────────────
export async function saveClinicianNote({
  patientUserId, clinicianId, noteText, followUpStatus = null
}) {
  if (!_supabase) {
    // Write to localStorage clinician notes
    const notes = _ls(AP3X_KEYS.CLINICIAN_NOTES, []);
    notes.unshift({
      id:               crypto.randomUUID(),
      patient_user_id:  patientUserId,
      clinician_id:     clinicianId || "local",
      note_text:        noteText,
      follow_up_status: followUpStatus,
      created_at:       new Date().toISOString()
    });
    _lsSet(AP3X_KEYS.CLINICIAN_NOTES, notes.slice(0, 500));
    return { success: true };
  }

  const { error } = await _supabase
    .from("clinician_notes")
    .insert({
      id:               crypto.randomUUID(),
      patient_user_id:  patientUserId,
      clinician_id:     clinicianId,
      note_text:        noteText,
      follow_up_status: followUpStatus,
      created_at:       new Date().toISOString()
    });

  if (error) {
    console.error("[AP3X] Note save error:", error.message);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function fetchClinicianNotes(patientUserId) {
  if (!_supabase) {
    // Read from localStorage
    return _ls(AP3X_KEYS.CLINICIAN_NOTES, [])
      .filter((n) => n.patient_user_id === patientUserId)
      .slice(0, 20);
  }

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
export function subscribeToPatientUpdates(clinicianId, onUpdate) {
  if (!_supabase) {
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
