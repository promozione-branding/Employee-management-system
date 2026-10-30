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
// now accepts an optional `phone` to override customer.phone
// ------------------------------------------------------------
export async function initiateCallService(customerId, phone = null) {
  const body = { customerId };
  if (phone) body.phone = phone;
  const res = await fetch(`${BASE}/initiate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  return handle(res);
}

// ------------------------------------------------------------
// Fetch call history for a client
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
// Recording link for a call
// ------------------------------------------------------------
export async function getRecordingLinkService(callId) {
  if (!callId) throw new Error("callId is required");
  const qs = new URLSearchParams({ callId }).toString();
  const res = await fetch(`${BASE}/recording?${qs}`, {
    method: "GET",
    credentials: "include",
  });
  return handle(res);
}

// ------------------------------------------------------------
// Salesperson: today's call stats (self)
// ------------------------------------------------------------
export async function dailyCallStatsService(agentId) {
  if (!agentId) throw new Error("agentId is required");
  const res = await fetch(`${BASE}/dashboard/daily-stats/${agentId}`, {
    method: "GET",
    credentials: "include",
  });
  return handle(res);
}

// ------------------------------------------------------------
// Admin: today's call stats for ALL agents
// ------------------------------------------------------------
export async function getAdminDailyCallStatsService() {
  const res = await fetch(`${BASE}/dashboard/admin-daily-stats`, {
    method: "GET",
    credentials: "include",
  });
  return handle(res);
}

// ------------------------------------------------------------
// Admin: paginated call logs with filters
// ------------------------------------------------------------
export async function getAdminCallLogsService(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, v);
  });
  const res = await fetch(`${BASE}/admin/logs?${qs.toString()}`, {
    method: "GET",
    credentials: "include",
  });
  return handle(res);
}

// ------------------------------------------------------------
// Admin: list of agents (for filter dropdown)
// ------------------------------------------------------------
export async function getAdminAgentsService() {
  const res = await fetch(`${BASE}/admin/agents`, {
    method: "GET",
    credentials: "include",
  });
  return handle(res);
}

// ------------------------------------------------------------
// Client-specific call history (used on client detail page)
// ------------------------------------------------------------
export async function getClientCallsService(customerId, scope = "all") {
  if (!customerId) throw new Error("customerId is required");
  const qs = new URLSearchParams();
  if (scope) qs.set("scope", scope);

  const res = await fetch(`${BASE}/client/${customerId}?${qs.toString()}`, {
    method: "GET",
    credentials: "include",
  });
  return handle(res);
}
