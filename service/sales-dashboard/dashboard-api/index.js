// service/sales-dashboard/dashboard-api/index.js

import axiosInstance from "@/service/axiosInstance";

export async function todayMeetingService(id, params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, v);
  });
  const url = `/api/sales-dashboard/dashboard-api/today-meeting/${id}${
    qs.toString() ? `?${qs.toString()}` : ""
  }`;
  const { data } = await axiosInstance.get(url);
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

export async function todayReminderService(id) {
  const { data } = await axiosInstance.get(
    `/api/sales-dashboard/dashboard-api/today-reminder/${id}`,
  );
  return data;
}

export async function proposalByEmployeeService(id) {
  const { data } = await axiosInstance.get(
    `/api/sales-dashboard/dashboard-api/proposal-send/${id}`,
  );
  return data;
}

export async function currentMonthDealValue(id) {
  const { data } = await axiosInstance.get(
    `/api/sales-dashboard/dashboard-api/current-month-deal-value/${id}`,
  );
  return data;
}

export async function currentMonthRevenueService(id) {
  const { data } = await axiosInstance.get(
    `/api/sales-dashboard/dashboard-api/current-month-revenue/${id}`,
  );
  return data;
}

export async function totalClientCount(id) {
  const { data } = await axiosInstance.get(
    `/api/sales-dashboard/dashboard-api/total-client/${id}`,
  );
  return data;
}

// ------------------------------------------------------------
// Daily call stats (from CallLog, per agent) — used by DailyCall card
// ------------------------------------------------------------
export async function dailyCallStatsService(id) {
  const { data } = await axiosInstance.get(
    `/api/calling/dashboard/daily-stats/${id}`,
  );
  return data;
}
