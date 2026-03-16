import axiosInstance from "@/service/axiosInstance";

export async function myClientService() {
  const { data } = await axiosInstance.get(
    "/api/admin-dashboard-api/my-clients",
  );

  return data;
}

export async function allClientCountService() {
  const { data } = await axiosInstance.get(
    "/api/admin-dashboard-api/all-client-count",
  );

  return data;
}

export async function allEmployeeService() {
  const { data } = await axiosInstance.get(
    "/api/admin-dashboard-api/total-employee",
  );

  return data;
}

export async function teamMemberService() {
  const { data } = await axiosInstance.get(
    "/api/admin-dashboard-api/team-members",
  );

  return data;
}

export async function currentMonthDealValueService() {
  const { data } = await axiosInstance.get(
    "/api/admin-dashboard-api/current-month-deal-value",
  );

  return data;
}

export async function currentMonthRevenueService() {
  const { data } = await axiosInstance.get(
    "/api/admin-dashboard-api/current-month-revenue",
  );

  return data;
}

export async function recentActivityService() {
  const { data } = await axiosInstance.get(
    "/api/admin-dashboard-api/recent-activity",
  );

  return data;
}

export async function getAnnouncementService() {
  const { data } = await axiosInstance.get("/api/annoucement/get");

  return data;
}

export async function getTodayMeetingService() {
  const { data } = await axiosInstance.get(
    "/api/admin-dashboard-api/today-meeting",
  );

  return data;
}

export async function getAdminDetailService() {
  const { data } = await axiosInstance.get(
    "/api/admin-dashboard-api/get-admin-detail",
  );

  return data;
}
