import axiosInstance from "@/service/axiosInstance";

export async function getSalesWorkClientService(id) {
  const { data } = await axiosInstance.get(`/api/employee/work/sales-work/clients/${id}`);
  return data;
}

export async function getSalesWorkProposalService(id) {
  const { data } = await axiosInstance.get(`/api/employee/work/sales-work/proposal/${id}`);
  return data;
}

export async function getUpdateService(id) {
  const { data } = await axiosInstance.get(`/api/employee/work/sales-work/update/${id}`);
  return data;
}


