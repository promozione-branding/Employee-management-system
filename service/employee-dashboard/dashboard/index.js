import axiosInstance from "@/service/axiosInstance";

export async function employeeClientService(id) {
  const { data } = await axiosInstance.get(
    `/api/employee-dashboard/dashboard/clients-list/${id}`,
  );
  return data;
}

export async function announcementService() {
  const { data } = await axiosInstance.get("/api/annoucement/get");
  return data;
}

export async function createAnnouncementService(formData) {
  const { data } = await axiosInstance.post(
    "/api/annoucement/create",
    formData,
  );
  return data;
}


export async function employeeRecentActivityService(id) {
  const { data } = await axiosInstance.get(
    `/api/employee-dashboard/dashboard/recent-activity/${id}`,
  );
  return data;
}

export async function allEmployeeContactService() {
  const { data } = await axiosInstance.get("/api/employee-dashboard/dashboard/contact");
  return data;
}
