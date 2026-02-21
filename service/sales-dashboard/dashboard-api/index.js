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

// current month deal value of sales

export async function currentMonthDealValue(id) {
  const { data } = await axiosInstance.get(
    `/api/sales-dashboard/dashboard-api/current-month-deal-value/${id}`,
  );

  return data;
}


// current month revenue 
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


