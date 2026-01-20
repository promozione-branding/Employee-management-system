import axiosInstance from "../axiosInstance";

export async function registerService(formData) {
  const data = await axiosInstance.post("/api/user/register", formData);
  return data;
}

export async function loginService(formData) {
  const { data } = await axiosInstance.post("/api/user/login", formData);
  return data;
}

export async function sendOtpService(formdata) {
  const { data } = await axiosInstance.post("/api/user/send-otp", formdata);
  return data;
}

export async function verifyOTP(formData) {
  const { data } = await axiosInstance.post("/api/user/verify-otp", formData);
  return data;
}

export async function createUserService(formData) {
  const { data } = await axiosInstance.post("/api/user/create-user", formData);
  return data;
}
