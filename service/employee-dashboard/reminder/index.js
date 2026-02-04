import axiosInstance from "@/service/axiosInstance";

export async function createReminderService(formData) {
  const { data } = await axiosInstance.post(
    "/api/employee-dashboard/reminder/create",
    formData,
  );
  return data;
}

export async function getReminderService(id) {
  const { data } = await axiosInstance.get(
    `/api/employee-dashboard/reminder/get-reminder/${id}`,
  );
  return data;
}
