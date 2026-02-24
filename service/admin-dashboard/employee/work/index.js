import axiosInstance from "@/service/axiosInstance";

export async function getEmployeeWorkService(id) {
  const { data } = await axiosInstance.get(`/api/employee/work/${id}`);
  return data;
}


export async function assignedClientService(id) {
  const { data } = await axiosInstance.get(`/api/employee/assigned-client-list/${id}`);
  return data;
}


