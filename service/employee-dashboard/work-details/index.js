import axiosInstance from "@/service/axiosInstance";

export async function addCheckListService(id, formData) {
  const { data } = await axiosInstance.patch(
    `/api/employee-dashboard/employee-work-details/add-check-list/${id}`,
    formData,
  );
  return data;
}
