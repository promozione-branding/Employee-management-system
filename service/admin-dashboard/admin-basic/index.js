import axiosInstance from "@/service/axiosInstance";

export async function createAdminBasicDetailService(formData) {
  const { data } = await axiosInstance.post(
    "/api/admin-dashboard-api/admin/admin-basic/create",
    formData,
  );

  return data;
}

export async function getAdminBasicDetailService(id) {
  const { data } = await axiosInstance.get(
    `/api/admin-dashboard-api/admin/admin-basic/get/${id}`,
  );

  return data;
}

export async function uploadProfileIageServices(formData) {
  const { data } = await axiosInstance.post(
    "/api/admin-dashboard-api/admin/admin-basic/upload-profile-image",
    formData,
  );
  return data;
}
