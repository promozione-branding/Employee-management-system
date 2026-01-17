import axiosInstance from "@/service/axiosInstance";

export async function getAllEmployeeForDashboard() {
  const { data } = await axiosInstance.get("/api/employee/user-employee");
  return data;
}

export async function createEmployeeProfile(formData) {
  const { data } = await axiosInstance.post(
    "/api/employee-dashboard/employee-basic-details/create",
    formData
  );
  return data;
}

export async function updateEmployeeImage(image) {
  const { data } = await axiosInstance.post(
    "/api/employee-dashboard/employee-basic-details/upload-image",
    image
  );
  return data;
}
