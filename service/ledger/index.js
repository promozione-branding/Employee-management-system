import axiosInstance from "../axiosInstance";

export async function fetchingProposalsInfo(id) {
  const { data } = await axiosInstance.post(
    "/api/proposals/proposal-ledger-info",
    { proposalId: id }
  );
  return data;
}

export async function createLedgerService(formData) {
  const { data } = await axiosInstance.post("/api/ledger/create", formData);
  return data;
}

export async function ledgerEntriesService(id, formData) {
  const { data } = await axiosInstance.put(`/api/ledger/${id}`, formData);
  return data;
}
