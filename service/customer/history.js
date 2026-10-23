export async function getEditHistoryService(customerId, params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `/api/customer/${customerId}/edit-history${query ? `?${query}` : ""}`;
  
  const response = await fetch(url);
  const data = await response.json();
  if (!data.success) throw new Error(data.message || "Failed to fetch history");
  return data;
}

export async function getEditHistoryMetaService() {
  return {
    success: true,
    data: {
      // Returning plain strings so your React keys don't break
      modules: ["customer", "meeting", "call", "work", "sales"],
      actions: ["CREATE", "UPDATE", "DELETE", "CALL", "STATUS_CHANGE"],
      roles: ["admin", "manager", "sales", "employee", "system"],
    },
  };
}
