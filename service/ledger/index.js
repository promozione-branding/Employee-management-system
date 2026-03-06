import axiosInstance from "../axiosInstance";

const getErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.message || error?.message || fallbackMessage;

export async function fetchingProposalsInfo(id) {
  const { data } = await axiosInstance.post(
    "/api/proposals/proposal-ledger-info",
    { proposalId: id }
  );
  return data;
}

export async function createLedgerService(formData) {
  try {
    const { data } = await axiosInstance.post("/api/ledger/create", formData);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Error while creating ledger"));
  }
}

export async function ledgerEntriesService(id, formData) {
  try {
    const { data } = await axiosInstance.put(`/api/ledger/${id}`, formData);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Error while creating entries"));
  }
}
