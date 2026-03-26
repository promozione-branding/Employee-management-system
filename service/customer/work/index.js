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

// create key word
export async function createKeyService(formData) {
  const { data } = await axiosInstance.post(
    `/api/customer/work/seo-sheet/create-keyword`,
    formData,
  );
  return data;
}

// update ranking key word
export async function updateRankingService(formData) {
  const { data } = await axiosInstance.post(
    `/api/customer/work/seo-sheet/update-ranking`,
    formData,
  );
  return data;
}

// update ranking key word
export async function getSeoSheetService(id) {
  const { data } = await axiosInstance.get(
    `/api/customer/work/seo-sheet/get-sheet/${id}`,
  );
  return data;
}

// edit ranking key word
export async function editRankingService(formData) {
  const { data } = await axiosInstance.put(
    `/api/customer/work/seo-sheet/update-ranking/edit-ranking`,
    formData,
  );
  return data;
}
