import axiosInstance from "@/service/axiosInstance";

export async function callUpdatesService(id) {
  const { data } = await axiosInstance.get(
    `/api/sales-dashboard/activity/updates/${id}`,
  );
  return data;
}

export async function clientListService(id) {
  const { data } = await axiosInstance.get(
    `/api/sales-dashboard/activity/customer/${id}`,
  );
  return data;
}

export async function proposalService(id) {
  const { data } = await axiosInstance.get(
    `/api/sales-dashboard/activity/proposal/${id}`,
  );
  return data;
}
