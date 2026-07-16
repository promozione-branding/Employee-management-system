import axiosInstance from "../axiosInstance";

export async function getAllCustomerServices(page, limit, isPaid) {
  const params = { page, limit, };
  if (isPaid) {
    params.isPaid = true;
  }

  const { data } = await axiosInstance.get("/api/customer/get-all-customer",
    { params, }
  );

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

// delete ledger entry
export async function deleteLedgerEntryService(ledgerId, entryId) {
  const { data } = await axiosInstance.delete(
    `/api/ledger/entry/${ledgerId}/${entryId}`,
  );
  return data;
}

// customer project cycle

export async function createCustomerProjectCycleService(formData) {
  const { data } = await axiosInstance.post(
    "/api/customer/project-cycle/create",
    formData,
  );

  return data;
}

export async function getCustomerProjectCycleService(id) {
  const { data } = await axiosInstance.get(
    `/api/customer/project-cycle/get-client-project/${id}`,
  );

  return data;
}

export async function getCustomerSeoProjectCycleService(id) {
  const { data } = await axiosInstance.get(
    `/api/customer/project-cycle/get-client-seo-project/${id}`,
  );

  return data;
}

export async function updateCustomerProjectCycleService(id, formData) {
  const { data } = await axiosInstance.put(
    `/api/customer/project-cycle/get-client-project/${id}`,
    formData,
  );
  return data;
}

export async function deleteCustomerProjectCycleService(id) {
  const { data } = await axiosInstance.delete(
    `/api/customer/project-cycle/get-client-project/${id}`,
  );
  return data;
}

export async function updateCustomerProjectPatchService(payload) {
  const { data } = await axiosInstance.patch(
    "/api/customer/project-cycle/update-duration",
    payload,
  );
  return data;
}

// meeting
export async function SalesPeopleMeetingService() {
  const { data } = await axiosInstance.get(
    "/api/customer/meeting/sales-person-dropdown",
  );
  return data;
}

// client history

export async function getClientHistoryService(id) {
  const { data } = await axiosInstance.get(
    `/api/customer/history/customer/${id}`,
  );
  return data;
}

// all delete customer
export async function getAllDeleteCustomer() {
  const { data } = await axiosInstance.get(
    "/api/customer/history/customer/deleted-customer",
  );

  return data;
}

// all history of client
export async function getAllHistory(id, page) {
  const { data } = await axiosInstance.get(
    `/api/customer/history/customer/${id}?page=${page}&limit=30`,
  );

  return data;
}

// all delete customer
export async function getAllSalesService() {
  const { data } = await axiosInstance.get("/api/customer/create/sales-person");

  return data;
}

export const removeEmployee = async (projectCycleId, projectDurationId, employeeId) => {
  const { data } = await axiosInstance.delete("/api/customer/project-cycle/remove-employee", {
    data: { projectCycleId, projectDurationId, employeeId, },
  });

  return data;
};
