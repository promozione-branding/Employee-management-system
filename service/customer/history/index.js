import axiosInstance from "@/service/axiosInstance";

export async function GetClientWorkDetailHistory(id) {
  const { data } = await axiosInstance.get(
    `/api/customer/history/work-details/${id}`,
  );
  return data;
}

export async function getClientProposalHistoryService(id) {
  const { data } = await axiosInstance.get(
    `/api/customer/history/proposal/${id}`,
  );
  return data;
}

export async function getClientInoviceHistoryService(id) {
  const { data } = await axiosInstance.get(
    `/api/customer/history/invoice/${id}`,
  );
  return data;
}

export async function getTeamUpdateAdminService(id) {
  const { data } = await axiosInstance.get(
    `/api/customer/history/team-update/${id}`,
  );
  return data;
}


export async function seoReportHistoryService(id) {
  const { data } = await axiosInstance.get(
    `/api/customer/history/seo-report/${id}`,
  );
  return data;
}
