// AP3X AnxietyCore — Local Auth
// ─────────────────────────────────────────────────────────────────
// Stores accounts in localStorage. Passwords are hashed with
// SubtleCrypto SHA-256 (browser-native, no dependencies).
// This is a local-first auth layer — swap for Supabase Auth in prod.
//
// Storage key: ap3x_accounts  → { [username]: { hash, role, userId, name } }
// Storage key: ap3x_session   → { username, role, userId, name, loginAt }

const ACCOUNTS_KEY = "ap3x_accounts";
const SESSION_KEY  = "ap3x_session";

// ── Hash helper ───────────────────────────────────────────────────
async function hashPassword(password) {
  const enc  = new TextEncoder();
  const buf  = await crypto.subtle.digest("SHA-256", enc.encode(password));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("");
}

// ── Register ──────────────────────────────────────────────────────
/**
 * register({ username, password, name, role })
 * role: "patient" | "clinician"
 * Returns { ok: true } or { ok: false, error: string }
 */
export async function register({ username, password, name, role }) {
  if (!username || !password) return { ok: false, error: "Username and password required." };
  const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}");
  if (accounts[username]) return { ok: false, error: "Username already taken." };

  const hash   = await hashPassword(password);
  const userId = "u_" + crypto.randomUUID();

  accounts[username] = { hash, role, userId, name: name || username };
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  return { ok: true, userId, role, name: name || username };
}

// ── Login ─────────────────────────────────────────────────────────
/**
 * login({ username, password })
 * Returns { ok: true, session } or { ok: false, error: string }
 */
export async function login({ username, password }) {
  if (!username || !password) return { ok: false, error: "Enter username and password." };
  const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}");
  const account  = accounts[username];
  if (!account) return { ok: false, error: "Account not found." };

  const hash = await hashPassword(password);
  if (hash !== account.hash) return { ok: false, error: "Incorrect password." };

  const session = {
    username,
    role:    account.role,
    userId:  account.userId,
    name:    account.name,
    loginAt: new Date().toISOString()
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { ok: true, session };
}

// ── Logout ────────────────────────────────────────────────────────
export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

// ── Get current session ───────────────────────────────────────────
export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch { return null; }
}

// ── Seed demo accounts (idempotent) ──────────────────────────────
/**
 * seedDemoAccounts()
 * Creates demo patient + clinician accounts if they don't exist.
 * Safe to call on every boot.
 */
export async function seedDemoAccounts() {
  const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}");
  if (!accounts["demo_patient"]) {
    await register({ username: "demo_patient",   password: "demo1234", name: "Alex T.",   role: "patient"   });
  }
  if (!accounts["demo_clinician"]) {
    await register({ username: "demo_clinician", password: "demo1234", name: "Dr. Morgan", role: "clinician" });
  }
}
