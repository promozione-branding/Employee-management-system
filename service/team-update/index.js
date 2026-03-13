import axiosInstance from "../axiosInstance";

export async function createTeamUpdateService(formData) {
  const { data } = await axiosInstance.post(
    "/api/team-update/create",
    formData,
  );
  return data;
}

export async function getTeamUpdateService() {
  const { data } = await axiosInstance.get("/api/team-update/get-update");
  return data;
}

export async function getAllEmailService() {
  const { data } = await axiosInstance.get("/api/team-update/get-all-email");
  return data;
}
