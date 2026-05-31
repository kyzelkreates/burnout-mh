// AP3X AnxietyCore — Minimal Anxiety Chart
// ─────────────────────────────────────────────────────────────────
// Zero-dependency canvas sparkline for the Patient PWA history tab.
// No external charting library required.

/**
 * createAnxietyChart(canvasId, dataPoints)
 * @param {string} canvasId — ID of <canvas> element
 * @param {number[]} dataPoints — anxiety scores (oldest first)
 */
export function createAnxietyChart(canvasId, dataPoints) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = canvas.offsetWidth || 340;
  const H = canvas.offsetHeight || 160;
  canvas.width  = W * window.devicePixelRatio;
  canvas.height = H * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const PAD  = { top: 12, right: 12, bottom: 28, left: 28 };
  const data = dataPoints.slice(-30); // last 30
  if (data.length < 2) {
    ctx.fillStyle = "#94a3b8";
    ctx.font = "13px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Not enough data yet", W / 2, H / 2);
    return;
  }

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top  - PAD.bottom;
  const maxV  = 10;
  const minV  = 0;

  function xPos(i) {
    return PAD.left + (i / (data.length - 1)) * plotW;
  }

  function yPos(v) {
    return PAD.top + (1 - (v - minV) / (maxV - minV)) * plotH;
  }

  // ── Grid lines ────────────────────────────────────────────────
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  [2, 4, 6, 8, 10].forEach((v) => {
    const y = yPos(v);
    ctx.beginPath();
    ctx.moveTo(PAD.left, y);
    ctx.lineTo(W - PAD.right, y);
    ctx.stroke();
    // Labels
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px system-ui";
    ctx.textAlign = "right";
    ctx.fillText(String(v), PAD.left - 4, y + 3);
  });

  // ── Gradient fill ─────────────────────────────────────────────
  const grad = ctx.createLinearGradient(0, PAD.top, 0, H - PAD.bottom);
  grad.addColorStop(0,   "rgba(239,68,68,0.3)");
  grad.addColorStop(0.5, "rgba(245,158,11,0.15)");
  grad.addColorStop(1,   "rgba(16,185,129,0.05)");

  ctx.beginPath();
  data.forEach((v, i) => {
    if (i === 0) ctx.moveTo(xPos(i), yPos(v));
    else ctx.lineTo(xPos(i), yPos(v));
  });
  ctx.lineTo(xPos(data.length - 1), H - PAD.bottom);
  ctx.lineTo(xPos(0), H - PAD.bottom);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // ── Line ──────────────────────────────────────────────────────
  ctx.beginPath();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#2563eb";
  ctx.lineJoin = "round";
  data.forEach((v, i) => {
    if (i === 0) ctx.moveTo(xPos(i), yPos(v));
    else ctx.lineTo(xPos(i), yPos(v));
  });
  ctx.stroke();

  // ── Dots ──────────────────────────────────────────────────────
  data.forEach((v, i) => {
    const color = v >= 8 ? "#ef4444" : v >= 6 ? "#f59e0b" : "#10b981";
    ctx.beginPath();
    ctx.arc(xPos(i), yPos(v), 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}
