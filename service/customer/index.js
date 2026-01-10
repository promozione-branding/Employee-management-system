import axiosInstance from "../axiosInstance";

export async function getAllCustomerServices() {
  const { data } = await axiosInstance.get("/api/customer/get-all-customer");
  return data;
}
export async function createCustomerServices(formData) {
  const { data } = await axiosInstance.post("/api/customer/create", formData);
  return data;
}

export async function deleteCustomerServices(id) {
  const { data } = await axiosInstance.delete(`/api/customer/${id}`);
  return data;
}

export async function getCustomerServices(id) {
  const { data } = await axiosInstance.get(`/api/customer/${id}`);
  return data;
}

export async function editCustomerServices(id, formData) {
  const { data } = await axiosInstance.put(`/api/customer/${id}`, formData);
  return data;
}

// all proposal of customers

export async function getAllProposalCustomer(id) {
  const { data } = await axiosInstance.get(`/api/customer/propsals/${id}`);
  return data;
}

// all Invoices of customer

export async function getAllinvoicesCustomer(id) {
  const { data } = await axiosInstance.get(`/api/customer/invoice/${id}`);
  return data;
}

// customer ledger

export async function customerLedgerService(id) {
  const { data } = await axiosInstance.get(`/api/customer/ledger/${id}`);
  return data;
}

// customer project cycle

export async function createCustomerProjectCycleService(formData) {
  const { data } = await axiosInstance.post(
    "/api/customer/project-cycle/create",
    formData
  );

  return data;
}

export async function getCustomerProjectCycleService(id) {
  const { data } = await axiosInstance.get(
    `/api/customer/project-cycle/get-client-project/${id}`
  );

  return data;
}

export async function updateCustomerProjectCycleService(id, formData) {
  const { data } = await axiosInstance.put(
    `/api/customer/project-cycle/get-client-project/${id}`,
    id,
    formData
  );
  return data;
}

export async function deleteCustomerProjectCycleService(id) {
  const { data } = await axiosInstance.delete(
    `/api/customer/project-cycle/get-client-project/${id}`
  );
  return data;
}
