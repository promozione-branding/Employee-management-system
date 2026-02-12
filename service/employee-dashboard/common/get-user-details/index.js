import axiosInstance from "@/service/axiosInstance";

export async function getUserDetails() {
  const { data } = await axiosInstance.get(
    "/api/employee-dashboard/employee-basic-details/get",
  );

  return data;
}
