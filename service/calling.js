// service/calling.js

const BASE = "/api/calling";

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ------------------------------------------------------------
// Initiate an outbound call (click-to-call)
// ------------------------------------------------------------
export async function initiateCallService(customerId) {
  const res = await fetch(`${BASE}/initiate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerId }),
    credentials: "include",
  });
  return handle(res);
}

// ------------------------------------------------------------
// Fetch call history for a client
// scope: "self" = only logged-in user's calls
//        "all"  = all calls for the client (admin/manager)
// ------------------------------------------------------------
export async function getCallHistoryService(customerId, scope = "self") {
  const qs = new URLSearchParams();
  if (customerId) qs.set("customerId", customerId);
  if (scope) qs.set("scope", scope);

  const res = await fetch(`${BASE}/history?${qs.toString()}`, {
    method: "GET",
    credentials: "include",
  });
  return handle(res);
}

// ------------------------------------------------------------
// Fetch a temporary recording link for a recording file
// `file` = recording filename from CallLog.recordingUrl
// ------------------------------------------------------------
// service/calling.js — replace getRecordingLinkService

export async function getRecordingLinkService(callId) {
  if (!callId) throw new Error("callId is required");
  const qs = new URLSearchParams({ callId }).toString();
  const res = await fetch(`${BASE}/recording?${qs}`, {
    method: "GET",
    credentials: "include",
  });
  return handle(res);
}