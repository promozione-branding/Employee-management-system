import axiosInstance from "../axiosInstance";

export async function createMeetingService(formData) {
  const { data } = await axiosInstance.post("/api/meeting/create", formData);
  return data;
}

export async function clientMeetingHistory(id) {
  const { data } = await axiosInstance.get(
    `/api/customer/meeting/meeting-history/${id}`
  );
  return data;
}

export async function checkNewMeetService(id) {
  const { data } = await axiosInstance.get(
    `/api/customer/meeting/is-new-meeting-check/${id}`
  );
  return data;
}

export async function addNewMeetingUpdate(id, formData) {
  const { data } = await axiosInstance.put(`/api/meeting/${id}`, formData);
  return data;
}
