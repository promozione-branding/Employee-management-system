// lib/myoperator.js
// Server-side only. NEVER import into client components.

const OBD_BASE = process.env.MYOP_OBD_BASE_URL;
const API_BASE = process.env.MYOP_API_BASE_URL;
const COMPANY_ID = process.env.MYOP_COMPANY_ID;
const X_API_KEY = process.env.MYOP_X_API_KEY;
const SECRET_KEY = process.env.MYOP_SECRET_KEY;
const API_TOKEN = process.env.MYOP_API_TOKEN;

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
export function normalizePhone(raw, defaultCountryCode = "91") {
  if (!raw) return "";
  let digits = String(raw).replace(/\D/g, "");
  if (!digits) return "";
  if (!digits.startsWith(defaultCountryCode) && digits.length <= 10) {
    digits = defaultCountryCode + digits;
  }
  return "+" + digits;
}

export function durationToSeconds(dur) {
  if (!dur) return 0;
  if (typeof dur === "number") return dur;
  const s = String(dur).trim();
  const hms = s.match(/^(\d+):(\d+):(\d+)$/);
  if (hms) return +hms[1] * 3600 + +hms[2] * 60 + +hms[3];
  const ms = s.match(/^(\d+):(\d+)$/);
  if (ms) return +ms[1] * 60 + +ms[2];
  return parseInt(s, 10) || 0;
}

// ------------------------------------------------------------
// OBD API — initiate an outbound call (User Dialer / Type 1)
// ------------------------------------------------------------
export async function initiateOutboundCall({
  number,
  userId,
  referenceId,
  publicIvrId,
  callerId,
  maxCallDuration = 3600,
  callHold = true,
  custom = {},
}) {
  if (!OBD_BASE || !X_API_KEY) {
    throw new Error("MyOperator OBD env not configured");
  }

  const body = {
    company_id: COMPANY_ID,
    secret_token: process.env.MYOP_IVR_SECRET_TOKEN,
    type: "1",
    number: normalizePhone(number),
    user_id: userId,
    public_ivr_id: publicIvrId || process.env.MYOP_PUBLIC_IVR_ID,
    caller_id: callerId || process.env.MYOP_VIRTUAL_NUMBER,
    reference_id: referenceId,
    max_call_duration: maxCallDuration,
    call_hold: callHold,
  };

  Object.entries(custom || {}).forEach(([k, v]) => {
    body[`custom_${k}`] = String(v);
  });

  const res = await fetch(OBD_BASE, {
    method: "POST",
    headers: {
      "x-api-key": X_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(
      data?.details || data?.message || `OBD call failed (${res.status})`,
    );
    err.status = res.status;
    err.raw = data;
    throw err;
  }
  return data;
}

// ------------------------------------------------------------
// Call API — search logs
// 🔧 ADAPT: exact endpoint path from MyOperator Postman
// ------------------------------------------------------------
export async function searchCallLogs(params = {}) {
  if (!API_BASE || !API_TOKEN) {
    throw new Error("MyOperator Call API env not configured");
  }
  const qs = new URLSearchParams({ token: API_TOKEN, ...params }).toString();
  const url = `${API_BASE}/api/call/search?${qs}`; // 🔧 ADAPT ME
  const res = await fetch(url, { method: "POST" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.message || `Search logs failed (${res.status})`);
    err.status = res.status;
    err.raw = data;
    throw err;
  }
  return data;
}

// ------------------------------------------------------------
// Call API — get recording link
// 🔧 ADAPT: exact endpoint path from MyOperator Postman
// ------------------------------------------------------------
export async function getRecordingLink(callId) {
  if (!API_BASE || !API_TOKEN) {
    throw new Error("MyOperator Call API env not configured");
  }
  const qs = new URLSearchParams({
    token: API_TOKEN,
    call_id: callId,
  }).toString();
  const url = `${API_BASE}/api/call/recording?${qs}`; // 🔧 ADAPT ME
  const res = await fetch(url, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(
      data?.message || `Recording fetch failed (${res.status})`,
    );
    err.status = res.status;
    err.raw = data;
    throw err;
  }
  return data;
}

// ------------------------------------------------------------
// User API — list MyOperator users (for mapping to employees)
// 🔧 ADAPT: exact endpoint path from MyOperator Postman
// ------------------------------------------------------------
export async function listMyOperatorUsers() {
  if (!API_BASE || !API_TOKEN) {
    throw new Error("MyOperator User API env not configured");
  }
  const qs = new URLSearchParams({ token: API_TOKEN }).toString();
  const url = `${API_BASE}/api/user/list?${qs}`; // 🔧 ADAPT ME
  const res = await fetch(url, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.message || `User list failed (${res.status})`);
    err.status = res.status;
    err.raw = data;
    throw err;
  }
  return data;
}