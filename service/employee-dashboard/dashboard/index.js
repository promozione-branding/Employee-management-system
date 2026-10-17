// service/employee-dashboard/dashboard/index.js

import axiosInstance from "@/service/axiosInstance";

export async function employeeClientService(id) {
  const { data } = await axiosInstance.get(
    `/api/employee-dashboard/dashboard/clients-list/${id}`,
  );
  return data;
}

// Accepts optional designation → filters announcements
export async function announcementService(designation) {
  const qs = new URLSearchParams();
  if (designation) qs.set("designation", designation);
  const url = `/api/annoucement/get${
    qs.toString() ? `?${qs.toString()}` : ""
  }`;
  const { data } = await axiosInstance.get(url);
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
  const { data } = await axiosInstance.get(
    "/api/employee-dashboard/dashboard/contact",
  );
  return data;
}
