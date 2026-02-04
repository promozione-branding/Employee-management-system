import axiosInstance from "@/service/axiosInstance";

export async function createCalendarService(formDate) {
  const { data } = await axiosInstance.post(
    "/api/sales-dashboard/calender/create",
    formDate,
  );
  return data;
}

export async function getCalendarService(id) {
  const { data } = await axiosInstance.get(
    `/api/sales-dashboard/calender/get-calendar/${id}`,
  );

  return data;
}
