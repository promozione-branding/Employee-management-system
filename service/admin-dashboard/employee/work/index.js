import axiosInstance from "@/service/axiosInstance";

export async function getEmployeeWorkService(id) {
  const { data } = await axiosInstance.get(
    `/api/employee/work/6996fa99d2facf0c09bec9ca`,
  );
  return data;
}
