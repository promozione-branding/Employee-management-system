import axiosInstance from "@/service/axiosInstance";

export async function searchClientService(query) {
  const { data } = await axiosInstance.get("/api/customer/search", {
    params: {
      q: query,
    },
  });

  return data;
}


