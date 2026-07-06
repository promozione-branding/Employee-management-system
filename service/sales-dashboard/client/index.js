import axiosInstance from "@/service/axiosInstance";

export async function createClientService(formData) {
  const { data } = await axiosInstance.post(
    "/api/sales-dashboard/client/create",
    formData,
  );
  return data;
}

export async function getClientService(id, page = 1, limit = 20, search = "", isPaid = false) {
  const { data } = await axiosInstance.get(`/api/sales-dashboard/client/get/${id}`, {
    params: {
      page,
      limit,
      search,
      ...(isPaid && { isPaid: true }),
    },
  });

  return data;
}
