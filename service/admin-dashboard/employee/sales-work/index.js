import axiosInstance from "@/service/axiosInstance";

export async function getSalesWorkClientService(id) {
  const { data } = await axiosInstance.get(
    `/api/employee/work/sales-work/clients/${id}`,
  );
  return data;
}

export async function getSalesWorkProposalService(id) {
  const { data } = await axiosInstance.get(
    `/api/employee/work/sales-work/proposal/${id}`,
  );
  return data;
}

export async function getUpdateService(id) {
  const { data } = await axiosInstance.get(
    `/api/employee/work/sales-work/update/${id}`,
  );
  return data;
}

// sales
export async function getSalesPersonService(id) {
  const { data } = await axiosInstance.get("/api/customer/create/sales-person");
  return data;
}

export async function clientSalesExecutiveService(id) {
  const { data } = await axiosInstance.get(
    `/api/customer/work/sales-work/client-sales-executive/${id}`,
  );
  return data;
}

export async function editSalesExecutiveService(id, formData) {
  const { data } = await axiosInstance.patch(
    `/api/customer/work/sales-work/edit-client-assignment/${id}`,
    formData,
  );
  return data;
}
