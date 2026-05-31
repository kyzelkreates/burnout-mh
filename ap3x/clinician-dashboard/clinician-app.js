// AP3X AnxietyCore — Clinician Dashboard App
// ─────────────────────────────────────────────────────────────────
// Wires the clinician dashboard UI to risk-aggregator + SSOT.
// Architecture: read patient data only. Write clinician_notes + flags.
//
// WIRING PATCH: Added provisioning flow, AI insights, lifecycle,
// and patient delivery package generation.

import {
  fetchPatientSummaries,
  subscribeToPatientUpdates,
  saveClinicianNote,
  fetchClinicianNotes,
  injectSupabaseClient,
  burnoutAIEngine,
  getAIInsight,
  provisionPatient,
  generatePatientDeliveryPackage,
  updateLifecycle
} from "./risk-aggregator.js";
import { DISCLAIMER, RISK_LEVELS, AP3X_KEYS } from "../shared/constants.js";
import { createAnxietyChart } from "../patient-pwa/chart.js";

// ── Boot ──────────────────────────────────────────────────────────
(async function boot() {
  renderDisclaimer();
  wireNav();
  wireTheme();
  wireSearch();
  wireDetailClose();
  wireNoteSave();
  wireProvisionForm();   // WIRING PATCH

  await loadAndRender();

  const unsubscribe = subscribeToPatientUpdates(null, async () => {
    await loadAndRender();
    flashRealtimeIndicator();
  });

  setInterval(async () => {
    await loadAndRender();
    flashRealtimeIndicator();
  }, 60_000);

  console.log("[AP3X Clinician] Dashboard booted.");
})();

// ── State ─────────────────────────────────────────────────────────
let _patients      = [];
let _activePatient = null;
let _filterRisk    = "";
let _searchQuery   = "";

// ── Load, AI-process, and render ──────────────────────────────────
async function loadAndRender() {
  _patients = await fetchPatientSummaries(null);

  // WIRING PATCH: run AI engine for every patient, write to AI_INSIGHTS
  _patients.forEach((p) => burnoutAIEngine(p));

  updateStats();
  renderOverviewGrid();
  renderAtRiskGrid();
  renderPatientTable();
}

// ── Stats ─────────────────────────────────────────────────────────
function updateStats() {
  const total    = _patients.length;
  const atRisk   = _patients.filter((p) => ["HIGH","CRITICAL","MISSING_DATA"].includes(p.risk)).length;
  const critical = _patients.filter((p) => p.risk === RISK_LEVELS.CRITICAL).length;
  const missing  = _patients.filter((p) => p.risk === RISK_LEVELS.MISSING).length;

  document.getElementById("stat-total").textContent   = total;
  document.getElementById("stat-at-risk").textContent  = atRisk;
  document.getElementById("stat-critical").textContent = critical;
  document.getElementById("stat-missing").textContent  = missing;
  document.getElementById("at-risk-count").textContent = atRisk;
}

// ── Overview grid ─────────────────────────────────────────────────
function renderOverviewGrid() {
  const grid = document.getElementById("overview-patient-grid");
  if (_patients.length === 0) {
    grid.innerHTML = `<p class="empty-state">No patients assigned. Use <strong>Provision Patient</strong> to add one.</p>`;
    return;
  }
  grid.innerHTML = _patients.map((p) => patientCardHTML(p)).join("");
  grid.querySelectorAll(".patient-card").forEach(wireCardClick);
}

// ── At-risk grid ──────────────────────────────────────────────────
function renderAtRiskGrid() {
  const at = _patients.filter((p) =>
    ["HIGH", "CRITICAL", RISK_LEVELS.MISSING].includes(p.risk)
  );
  const grid = document.getElementById("at-risk-grid");
  if (at.length === 0) {
    grid.innerHTML = `<p class="empty-state">No at-risk patients right now. 🟢</p>`;
    return;
  }
  grid.innerHTML = at.map((p) => patientCardHTML(p)).join("");
  grid.querySelectorAll(".patient-card").forEach(wireCardClick);
}

// ── Patient card HTML ─────────────────────────────────────────────
// WIRING PATCH: shows burnout risk score from AI insight, lifecycle badge
function patientCardHTML(p) {
  const insight    = getAIInsight(p.user_id);
  const riskScore  = insight ? insight.riskScore : "–";
  const scoreClass = _scoreClass(p.latest_score);
  const scoreText  = p.latest_score !== null ? String(p.latest_score) : "–";
  const lastSeen   = p.last_checkin ? _relTime(p.last_checkin) : "No data";
  const trendIcon  = p.trend === "up" ? "↑" : p.trend === "down" ? "↓" : "→";
  const trendClass = p.trend === "up" ? "trend-up" : p.trend === "down" ? "trend-down" : "trend-flat";

  // Lifecycle badge
  const lcStatus  = p.lifecycle?.status || (p.last_checkin ? "active" : "pending");
  const lcBadge   = `<span class="lifecycle-badge lc-${lcStatus}">${lcStatus}</span>`;

  const sparkData   = p.logs.map((l) => l.anxiety_score);
  const sparkPoints = _miniSparkline(sparkData);

  return `
    <div class="patient-card risk-${p.risk}" data-uid="${_esc(p.user_id)}">
      <div class="card-header">
        <div>
          <div class="card-name">${_esc(p.name)}</div>
          <div class="card-id">Last seen: ${lastSeen}</div>
        </div>
        <div class="card-score ${scoreClass}">${scoreText}</div>
      </div>
      <div class="card-sparkline">
        ${sparkPoints ? `<svg viewBox="0 0 80 36" style="width:100%;height:36px">${sparkPoints}</svg>` : ""}
      </div>
      <div class="card-footer">
        <span class="risk-badge ${p.risk}">${_riskLabel(p.risk)}</span>
        <span class="${trendClass}" title="Trend">${trendIcon}</span>
        ${lcBadge}
        <span class="ai-risk-score" title="Burnout Risk Score">🤖 ${riskScore}/100</span>
      </div>
    </div>
  `;
}

function wireCardClick(card) {
  card.addEventListener("click", () => {
    const uid     = card.dataset.uid;
    const patient = _patients.find((p) => p.user_id === uid);
    if (patient) openDetailPanel(patient);
  });
}

// ── Patient table ─────────────────────────────────────────────────
function renderPatientTable() {
  const tbody = document.getElementById("patient-table-body");
  let filtered = _patients;

  if (_filterRisk) filtered = filtered.filter((p) => p.risk === _filterRisk);
  if (_searchQuery) {
    const q = _searchQuery.toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(q));
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-state">No patients match.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((p) => {
    const insight    = getAIInsight(p.user_id);
    const riskScore  = insight ? insight.riskScore : "–";
    const trendIcon  = p.trend === "up" ? "↑" : p.trend === "down" ? "↓" : "→";
    const trendClass = p.trend === "up" ? "trend-up" : p.trend === "down" ? "trend-down" : "trend-flat";
    const lcStatus   = p.lifecycle?.status || (p.last_checkin ? "active" : "pending");
    return `
      <tr data-uid="${_esc(p.user_id)}" style="cursor:pointer">
        <td><strong>${_esc(p.name)}</strong></td>
        <td>${p.last_checkin ? _relTime(p.last_checkin) : "<em>Never</em>"}</td>
        <td>${p.latest_score !== null ? p.latest_score : "–"} / 10</td>
        <td><span class="risk-badge ${p.risk}">${_riskLabel(p.risk)}</span></td>
        <td><span class="${trendClass}">${trendIcon}</span></td>
        <td><span class="ai-risk-score">🤖 ${riskScore}/100</span></td>
        <td><span class="lifecycle-badge lc-${lcStatus}">${lcStatus}</span></td>
      </tr>
    `;
  }).join("");

  tbody.querySelectorAll("tr").forEach((row) => {
    row.addEventListener("click", () => {
      const uid     = row.dataset.uid;
      const patient = _patients.find((p) => p.user_id === uid);
      if (patient) openDetailPanel(patient);
    });
  });
}

// ── Detail panel ──────────────────────────────────────────────────
async function openDetailPanel(patient) {
  _activePatient = patient;

  document.getElementById("detail-name").textContent = patient.name;
  document.getElementById("detail-meta").textContent =
    `User ID: ${patient.user_id.slice(0, 16)} · Sleep last night: ${patient.sleep_hours ?? "unknown"} hrs`;

  const badge       = document.getElementById("detail-risk-badge");
  badge.className   = `risk-badge ${patient.risk}`;
  badge.textContent = _riskLabel(patient.risk);

  document.getElementById("detail-last-seen").textContent =
    patient.last_checkin ? `Last check-in: ${_relTime(patient.last_checkin)}` : "No check-in data";

  // WIRING PATCH: AI insight summary
  const insight    = getAIInsight(patient.user_id);
  const aiEl       = document.getElementById("detail-ai-insight");
  if (aiEl) {
    aiEl.innerHTML = insight
      ? `<div class="ai-summary-bar">
           <span class="ai-risk-pill">🤖 ${insight.riskScore}/100 Burnout Risk</span>
           <span class="ai-summary-text">${_esc(insight.summary)}</span>
           <span class="ai-updated">Updated ${_relTime(insight.lastUpdated)}</span>
         </div>`
      : "";
  }

  // WIRING PATCH: lifecycle status
  const lcEl     = document.getElementById("detail-lifecycle");
  const lcStatus = patient.lifecycle?.status || "unknown";
  if (lcEl) {
    lcEl.innerHTML = `
      <span class="lifecycle-badge lc-${lcStatus}">${lcStatus}</span>
      ${patient.lifecycle?.deployedAt ? `<span style="font-size:11px;color:var(--muted)">Deployed ${_relTime(patient.lifecycle.deployedAt)}</span>` : ""}
      ${patient.lifecycle?.lastSync   ? `<span style="font-size:11px;color:var(--muted)">Last sync ${_relTime(patient.lifecycle.lastSync)}</span>` : ""}
      ${patient.lifecycle?.onboardingComplete === false ? `<span style="font-size:11px;color:#f59e0b">⏳ Onboarding pending</span>` : ""}
    `;
  }

  // Chart
  const scores = patient.logs.map((l) => l.anxiety_score);
  setTimeout(() => createAnxietyChart("detail-chart", scores), 50);

  // Mood notes
  const moodList  = document.getElementById("detail-mood-list");
  const notedLogs = patient.logs.filter((l) => l.note).slice(-5).reverse();
  if (notedLogs.length === 0) {
    moodList.innerHTML = `<p class="empty-state">No mood notes.</p>`;
  } else {
    moodList.innerHTML = notedLogs.map((l) => `
      <div class="detail-list-item">
        <div>${_esc(l.note)}</div>
        <div class="detail-item-date">${_fmtDate(l.created_at)}</div>
      </div>
    `).join("");
  }

  // Flags
  const flagEl = document.getElementById("detail-flags");
  if (patient.flags.length === 0) {
    flagEl.innerHTML = `<p class="empty-state">No flags.</p>`;
  } else {
    flagEl.innerHTML = patient.flags.map((f) =>
      `<span class="flag-chip">${f.replace(/_/g, " ")}</span>`
    ).join("");
  }

  // WIRING PATCH: delivery package section
  const deliveryEl = document.getElementById("detail-delivery");
  if (deliveryEl) {
    const pkg = generatePatientDeliveryPackage(patient.user_id);
    if (pkg) {
      deliveryEl.innerHTML = `
        <div class="delivery-row">
          <button class="btn-delivery" onclick="copyDeliveryLink('${_esc(patient.user_id)}')">📋 Copy Link</button>
          <button class="btn-delivery" onclick="showQR('${_esc(patient.user_id)}')">📱 Generate QR</button>
          <a class="btn-delivery" href="${_esc(pkg.deliveryUrl)}" target="_blank">🚀 Open Patient App</a>
        </div>
        <div id="qr-output-${_esc(patient.user_id)}" class="qr-output" style="display:none"></div>
      `;
    } else {
      deliveryEl.innerHTML = `<p class="empty-state" style="font-size:12px">No delivery package — patient provisioned externally.</p>`;
    }
  }

  await renderNotesForPatient(patient.user_id);
  document.getElementById("detail-panel").classList.remove("hidden");
}

async function renderNotesForPatient(userId) {
  const notes = await fetchClinicianNotes(userId);
  const el    = document.getElementById("detail-notes-list");

  if (notes.length === 0) {
    el.innerHTML = `<p class="empty-state">No clinician notes yet.</p>`;
    return;
  }

  el.innerHTML = notes.map((n) => `
    <div class="note-item">
      <div class="note-text">${_esc(n.note_text)}</div>
      <div class="note-meta">
        ${_fmtDate(n.created_at)}
        ${n.follow_up_status ? ` · <strong>${n.follow_up_status}</strong>` : ""}
      </div>
    </div>
  `).join("");
}

// ── Note save ─────────────────────────────────────────────────────
function wireNoteSave() {
  document.getElementById("save-note-btn").addEventListener("click", async () => {
    if (!_activePatient) return;
    const text   = document.getElementById("new-note-input").value.trim();
    const status = document.getElementById("follow-up-status").value;
    if (!text) return;

    await saveClinicianNote({
      patientUserId:   _activePatient.user_id,
      clinicianId:     null,
      noteText:        text,
      followUpStatus:  status || null
    });

    document.getElementById("new-note-input").value  = "";
    document.getElementById("follow-up-status").value = "";
    await renderNotesForPatient(_activePatient.user_id);
  });
}

// ── Detail close ──────────────────────────────────────────────────
function wireDetailClose() {
  document.getElementById("close-detail").addEventListener("click", () => {
    document.getElementById("detail-panel").classList.add("hidden");
    _activePatient = null;
  });
}

// ── WIRING PATCH: Provisioning form ──────────────────────────────
function wireProvisionForm() {
  const form = document.getElementById("provision-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("provision-name");
    const name      = nameInput?.value.trim();
    if (!name) { showProvisionError("Patient name is required."); return; }

    const prov = provisionPatient({ name, clinicianId: "local" });
    renderProvisionSuccess(prov);
    nameInput.value = "";
    // Reload dashboard to show new patient
    loadAndRender();
  });
}

function showProvisionError(msg) {
  const el = document.getElementById("provision-error");
  if (el) { el.textContent = msg; el.style.display = "block"; }
}

function renderProvisionSuccess(prov) {
  const el = document.getElementById("provision-result");
  if (!el) return;

  el.style.display = "block";
  el.innerHTML = `
    <div class="provision-success">
      <div class="ps-header">✅ Patient Active — ${_esc(prov.name)}</div>
      <div class="ps-id">Patient ID: <code>${_esc(prov.patientId)}</code></div>
      <div class="ps-link-row">
        <input type="text" id="ps-link-input" class="ps-link-input" readonly value="${_esc(prov.deliveryUrl)}"/>
        <button class="btn-delivery" onclick="copyProvisionLink()">📋 Copy Link</button>
      </div>
      <div class="ps-actions">
        <button class="btn-delivery" onclick="showQR('${_esc(prov.patientId)}')">📱 Generate QR</button>
        <a class="btn-delivery" href="${_esc(prov.deliveryUrl)}" target="_blank">🚀 Open Patient App</a>
      </div>
      <div id="qr-output-${_esc(prov.patientId)}" class="qr-output" style="display:none"></div>
    </div>
  `;
}

// ── WIRING PATCH: Delivery helpers (global scope for inline onclick) ─
window.copyDeliveryLink = function(patientId) {
  const pkg = generatePatientDeliveryPackage(patientId);
  if (!pkg) return;
  navigator.clipboard.writeText(pkg.deliveryUrl).then(() => _toast("✅ Link copied!"));
};

window.copyProvisionLink = function() {
  const inp = document.getElementById("ps-link-input");
  if (!inp) return;
  navigator.clipboard.writeText(inp.value).then(() => _toast("✅ Link copied!"));
};

window.showQR = function(patientId) {
  const pkg = generatePatientDeliveryPackage(patientId);
  if (!pkg) return;

  const el = document.getElementById(`qr-output-${patientId}`);
  if (!el) return;

  // QR code rendered as SVG using only a URL (no external libs — inline QR string display)
  // We use the qrserver.com API URL — just an img tag (no script injection)
  const encodedUrl = encodeURIComponent(pkg.qrPayload);
  el.style.display = "block";
  el.innerHTML = `
    <div style="text-align:center;padding:10px 0">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodedUrl}"
           alt="QR Code — ${_esc(pkg.patientId)}"
           style="border:4px solid #fff;border-radius:8px;max-width:180px"
           onerror="this.parentElement.innerHTML='<code style=font-size:11px;word-break:break-all>${_esc(pkg.qrPayload)}</code>'"/>
      <div style="font-size:10px;color:var(--muted);margin-top:6px">Scan to open patient app</div>
    </div>
  `;
};

// ── Nav ────────────────────────────────────────────────────────────
function wireNav() {
  const titles = {
    overview:  "Overview",
    "at-risk": "At Risk Patients",
    patients:  "All Patients",
    provision: "Provision Patient"   // WIRING PATCH
  };

  document.querySelectorAll(".nav-item[data-view]").forEach((item) => {
    item.addEventListener("click", () => {
      const view = item.dataset.view;
      document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
      document.querySelectorAll(".view-section").forEach((s) => s.classList.add("hidden"));
      item.classList.add("active");
      document.getElementById(`view-${view}`)?.classList.remove("hidden");
      document.getElementById("view-title").textContent = titles[view] || "";
    });
  });
}

// ── Search + filter ───────────────────────────────────────────────
function wireSearch() {
  document.getElementById("patient-search").addEventListener("input", (e) => {
    _searchQuery = e.target.value;
    renderPatientTable();
  });

  document.getElementById("risk-filter").addEventListener("change", (e) => {
    _filterRisk = e.target.value;
    renderPatientTable();
  });
}

// ── Theme ─────────────────────────────────────────────────────────
function wireTheme() {
  const btn   = document.getElementById("theme-toggle-cli");
  const saved = localStorage.getItem("ap3x_cli_theme") || "light";
  _applyTheme(saved);
  btn.addEventListener("click", () => {
    const next = document.body.dataset.theme === "dark" ? "light" : "dark";
    _applyTheme(next);
    localStorage.setItem("ap3x_cli_theme", next);
  });
}

function _applyTheme(theme) {
  document.body.dataset.theme = theme;
  document.getElementById("theme-toggle-cli").textContent = theme === "dark" ? "☀️" : "🌙";
}

// ── Realtime flash ────────────────────────────────────────────────
function flashRealtimeIndicator() {
  const el   = document.getElementById("realtime-indicator");
  el.style.opacity = "0.3";
  setTimeout(() => (el.style.opacity = "1"), 300);
}

// ── Disclaimer ────────────────────────────────────────────────────
function renderDisclaimer() {
  document.getElementById("cli-disclaimer").textContent = DISCLAIMER;
}

// ── Toast ─────────────────────────────────────────────────────────
function _toast(msg) {
  const t = document.createElement("div");
  t.className   = "cli-toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

// ── Helpers ───────────────────────────────────────────────────────
function _scoreClass(score) {
  if (score === null) return "score-none";
  if (score >= 8)     return "score-critical";
  if (score >= 6)     return "score-high";
  if (score >= 4)     return "score-medium";
  return "score-low";
}

function _riskLabel(risk) {
  return {
    LOW:          "Low",
    MEDIUM:       "Medium",
    HIGH:         "High",
    CRITICAL:     "Critical",
    MISSING_DATA: "Missing Data",
    MISSING:      "Missing Data"
  }[risk] ?? risk;
}

function _relTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m    = Math.floor(diff / 60_000);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function _fmtDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  });
}

function _esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function _miniSparkline(data) {
  if (!data || data.length < 2) return "";
  const W = 80, H = 36;
  const max = 10, min = 0;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / (max - min)) * H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const last  = data[data.length - 1];
  const color = last >= 8 ? "#ef4444" : last >= 6 ? "#f59e0b" : "#10b981";
  return `<polyline points="${pts.join(" ")}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>`;
}
