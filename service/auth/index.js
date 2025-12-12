import axiosInstance from "../axiosInstance";

export async function registerService(formData) {
  const data = await axiosInstance.post("/api/user/register", formData);
  return data;
}

export async function loginService(formData) {
  const { data } = await axiosInstance.post("/api/user/login", formData);
  return data;
}
