import axiosInstance from "@/service/axiosInstance";

export async function getEmployeesByDomain(domain) {
  const { data } = await axiosInstance.get(
    `/api/customer/work/employee-by-domain?domain=${domain}`
  );

  return data;
}
