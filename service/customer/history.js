// service/customer/history.js

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

/* ================================================================
   History service functions — all follow the same { success, data, message }
   pattern as getEditHistoryService above.
   ================================================================ */

async function _get(url) {
  const res = await fetch(url);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Failed to fetch");
  return data;
}

/** Work detail history for a client/work item */
export async function GetClientWorkDetailHistory(id) {
  if (!id) return { success: false, message: "id is required", data: [] };
  try {
    return await _get(`/api/customer/history/work-details/${id}`);
  } catch (err) {
    return { success: false, message: err.message, data: [] };
  }
}

/** Invoice history */
export async function getClientInoviceHistoryService(id) {
  if (!id) return { success: false, message: "id is required", data: [] };
  try {
    return await _get(`/api/customer/history/invoice/${id}`);
  } catch (err) {
    return { success: false, message: err.message, data: [] };
  }
}

/** Deleted proposal history */
export async function getClientProposalDeletedHistory(id) {
  if (!id) return { success: false, message: "id is required", data: [] };
  try {
    return await _get(`/api/customer/history/proposal/deleted-proposal/${id}`);
  } catch (err) {
    return { success: false, message: err.message, data: [] };
  }
}

/** Proposal history */
export async function getClientProposalHistoryService(id) {
  if (!id) return { success: false, message: "id is required", data: [] };
  try {
    return await _get(`/api/customer/history/proposal/${id}`);
  } catch (err) {
    return { success: false, message: err.message, data: [] };
  }
}

/** Proposal update history */
export async function getClientProposalUpdateHistory(id) {
  if (!id) return { success: false, message: "id is required", data: [] };
  try {
    return await _get(`/api/customer/history/proposal/edit-proposal/${id}`);
  } catch (err) {
    return { success: false, message: err.message, data: [] };
  }
}

/** Team update admin history for a client */
export async function getTeamUpdateAdminService(clientId) {
  if (!clientId) return { success: false, message: "clientId is required", data: [] };
  try {
    return await _get(`/api/customer/history/team-update/${clientId}`);
  } catch (err) {
    return { success: false, message: err.message, data: [] };
  }
}
 
/** SEO report history */
export async function seoReportHistoryService(id) {
  if (!id) return { success: false, message: "id is required", data: [] };
  try {
    return await _get(`/api/customer/history/seo-report/${id}`);
  } catch (err) {
    return { success: false, message: err.message, data: [] };
  }
}
