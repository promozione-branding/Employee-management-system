import axiosInstance from "@/service/axiosInstance";

export async function searchClientService(query, page = 1, isPaid) {
  const params = { q: query, page, limit: 20, };

  if (isPaid) {
    params.isPaid = true;
  }

  const { data } = await axiosInstance.get("/api/customer/search",
    { params, }
  );

  return data;
}