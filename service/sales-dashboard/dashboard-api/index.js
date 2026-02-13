import axiosInstance from "@/service/axiosInstance";

export async function todayMeetingService(id) {
  const { data } = await axiosInstance.get(
    `/api/sales-dashboard/dashboard-api/today-meeting/${id}`,
  );
  return data;
}

export async function recentActivityService(id) {
  const { data } = await axiosInstance.get(
    `/api/sales-dashboard/dashboard-api/recent-activity/${id}`,
  );
  return data;
}

export async function dailyCallService(id) {
  const { data } = await axiosInstance.get(
    `/api/sales-dashboard/dashboard-api/daily-call/${id}`,
  );
  return data;
}
