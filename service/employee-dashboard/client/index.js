import axiosInstance from "@/service/axiosInstance";

export async function clientDetailService(id) {
  const { data } = await axiosInstance.get(
    `/api/employee/client/client-details/${id}`,
  );
  return data;
}
