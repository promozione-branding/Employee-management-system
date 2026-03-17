import axiosInstance from "@/service/axiosInstance";

export async function createAttachmentServices(payload) {
  const { data } = await axiosInstance.post(
    "/api/customer/attachment/create",
    payload
  );
  return data;
}

export async function getClientAttachementServices(id) {
  const { data } = await axiosInstance.get(`/api/customer/attachment/${id}`);
  return data;
}


export async function uploadAssetServices(formData) {
  const { data } = await axiosInstance.post(`/api/customer/attachment`,formData);
  return data;
}

