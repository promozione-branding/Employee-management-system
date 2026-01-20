import axiosInstance from "@/service/axiosInstance";

export async function getAllEmployeeForDashboard() {
  const { data } = await axiosInstance.get("/api/employee/user-employee");
  return data;
}

export async function createEmployeeProfile(formData) {
  const { data } = await axiosInstance.post(
    "/api/employee-dashboard/employee-basic-details/create",
    formData,
  );
  return data;
}

export async function updateEmployeeImage(image) {
  const { data } = await axiosInstance.post(
    "/api/employee-dashboard/employee-basic-details/upload-image",
    image,
  );
  return data;
}

export async function getEmployeeDetailsService() {
  const { data } = await axiosInstance.get(
    "/api/employee-dashboard/employee-basic-details",
  );
  return data;
}

export async function getEmployeeAssignedClientService(id) {
  const { data } = await axiosInstance.get(
    `/api/employee/get-client-list/${id}`,
  );
  return data;
}

export async function getWorkDetailByIdService(id) {
  const { data } = await axiosInstance.get(
    `http://localhost:3000/api/customer/work/get-work-details/${id}`,
  );

  return data;
}
