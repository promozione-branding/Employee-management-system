import toast from "react-hot-toast";
import axiosInstance from "../axiosInstance";

export async function createProposelService(formData) {
  const { data } = await axiosInstance.post("/api/proposals/create", formData);
  return data;
}

export async function deleteProposalService(id) {
  const { data } = await axiosInstance.delete(`/api/proposals/${id}`);
  return data;
}

export async function getProposalByIdService(id) {
  const { data } = await axiosInstance.get(`/api/proposals/${id}`);
  return data;
}

export async function editProposalService(id, formData) {
  const { data } = await axiosInstance.put(`/api/proposals/${id}`, formData);
  return data;
}

export async function pdfDownloadService(id) {
  try {
    const { data } = await axiosInstance.get(
      `/api/proposals/pdf-download-proposal/${id}`
    );
    if (data.success) {
      toast.success(data.message);
      return data;
    }
  } catch (error) {
    console.log(error);
    toast.error(error.message);
  }
}

export async function sendProposalPdfEmailService(id) {
  const { data } = await axiosInstance.post(`/api/proposals/send-email`, id);
  return data;
}

export async function proposalLedgerEntryValidation(id, formData) {
  const { data } = await axiosInstance.put(
    `/api/proposals/proposal-entry/${id}`,
    formData
  );
  return data;
}
