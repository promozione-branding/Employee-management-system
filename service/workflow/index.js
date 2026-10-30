// service/workflow/index.js

export async function createWorkflowService(payload) {
  const res = await fetch("/api/workflow/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || data?.success === false) {
    throw new Error(data?.message || "Failed to create workflow");
  }
  return data;
}
