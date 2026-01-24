import axiosInstance from "@/service/axiosInstance";

export async function GetClientWorkDetailHistory(id) {
  const { data } = await axiosInstance.get(
    `/api/customer/history/work-details/${id}`,
  );
  return data;
}
