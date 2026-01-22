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
    `/api/customer/work/get-work-details/${id}`,
  );

  return data;
}

export async function checkEmployeeExists(id) {
  const { data } = await axiosInstance.get(
    `/api/employee-dashboard/employee-basic-details/check-employee-exists/${id}`,
  );

  return data;
}

export async function getAllEmployee() {
  const { data } = await axiosInstance.get(
    "/api/employee-dashboard/employee-basic-details/all-employee",
  );
  return data;
}

export async function getEmployeeProfileService(id) {
  const { data } = await axiosInstance.get(
    `/api/employee-dashboard/employee-basic-details/${id}`,
  );

  return data;
}

export async function editEmployeeBasicDetails(id, formData) {
  const { data } = await axiosInstance.patch(
    `/api/employee-dashboard/employee-basic-details/${id}`,
    formData,
  );

  return data;
}

export async function newEmployeeListService() {
  const { data } = await axiosInstance.get("/api/employee/new-employee");
  return data;
}
