import axiosInstance from "@/service/axiosInstance";

export async function createProposalService(formData) {
  const { data } = await axiosInstance.post(
    "/api/sales-dashboard/proposal/create",
    formData,
  );
  return data;
}

export async function getProposalService(salesPersonId, clientId) {
  const { data } = await axiosInstance.get(
    `/api/sales-dashboard/proposal/get/${salesPersonId}/${clientId}`,
  );
  return data;
}
