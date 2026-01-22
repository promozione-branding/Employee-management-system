import axiosInstance from "@/service/axiosInstance";

export async function getEmployeesByDomain(domain) {
  const { data } = await axiosInstance.get(
    `/api/customer/work/employee-by-domain?domain=${domain}`,
  );

  return data;
}

export async function createWorkDetailsService(formData) {
  const { data } = await axiosInstance.post(
    "/api/customer/work/create-work-details",
    formData,
  );

  return data;
}

export async function getClientWorkService(id) {
  const { data } = await axiosInstance.get(
    `/api/customer/work/client-work-details/${id}`,
  );
  return data;
}
