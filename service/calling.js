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

export async function initiateCallService(customerId) {
  const res = await fetch(`${BASE}/initiate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerId }),
    credentials: "include",
  });
  return handle(res);
}

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