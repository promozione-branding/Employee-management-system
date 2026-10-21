import axiosInstance from "@/service/axiosInstance";
const BASE = "/api/proposalNew/ledger";

export const getLedgerNewService = async (customerId) => {
  const { data } = await axiosInstance.get(BASE, { params: { customerId } });
  return data;
};

export const createLedgerNewService = async (payload) => {
  const { data } = await axiosInstance.post(BASE, payload);
  return data;
};

export const updateLedgerNewService = async (payload) => {
  const { data } = await axiosInstance.put(BASE, payload);
  return data;
};

export const deleteLedgerNewService = async (id) => {
  const { data } = await axiosInstance.delete(`${BASE}?id=${id}`);
  return data;
};
