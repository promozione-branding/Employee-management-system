import axiosInstance from "@/service/axiosInstance";

export async function createClientService(formData) {
  const { data } = await axiosInstance.post(
    "/api/sales-dashboard/client/create",
    formData,
  );
  return data;
}

export async function getClientService(id) {
  const { data } = await axiosInstance.get(
    `/api/sales-dashboard/client/get/${id}`
  );
  return data;
}
