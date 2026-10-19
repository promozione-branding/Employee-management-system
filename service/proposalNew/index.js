import axiosInstance from "@/service/axiosInstance";
const BASE = "/api/proposalNew";

export const listProposalNewService = async (clientId) => {
  const { data } = await axiosInstance.get(BASE, { params: { clientId } });
  return data;
};
export const getProposalNewByIdService = async (id) => {
  const { data } = await axiosInstance.get(`${BASE}/${id}`);
  return data;
};
export const createProposalNewService = async (payload) => {
  const { data } = await axiosInstance.post(BASE, payload);
  return data;
};
export const updateProposalNewService = async (id, payload) => {
  const { data } = await axiosInstance.put(`${BASE}/${id}`, payload);
  return data;
};
export const deleteProposalNewService = async (id) => {
  const { data } = await axiosInstance.delete(`${BASE}/${id}`);
  return data;
};
export const sendProposalMailService = async (id) => {
  const { data } = await axiosInstance.post(`${BASE}/${id}/send-mail`);
  return data;
};
