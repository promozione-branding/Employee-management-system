// service/invoiceNew/index.js

import axiosInstance from '@/service/axiosInstance';
const BASE = '/api/invoiceNew';

export const listInvoiceNewService = async (clientId) => {
    const { data } = await axiosInstance.get(BASE, { params: { clientId } });
    return data;
};
export const getInvoiceNewByIdService = async (id) => {
    const { data } = await axiosInstance.get(`${BASE}/${id}`);
    return data;
};
export const generateInvoiceFromProposalService = async (payload) => {
    const { data } = await axiosInstance.post(BASE, payload);
    return data;
};
export const updateInvoiceNewService = async (id, payload) => {
    const { data } = await axiosInstance.put(`${BASE}/${id}`, payload);
    return data;
};
export const sendInvoiceMailService = async (id, payload) => {
    const { data } = await axiosInstance.post(`${BASE}/${id}/send-mail`, payload);
    return data;
};
export const deleteInvoiceNewService = async (id) => {
    const { data } = await axiosInstance.delete(`${BASE}/${id}`);
    return data;
};
