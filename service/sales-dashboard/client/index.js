// service/sales-dashboard/client/index.js

import axiosInstance from '@/service/axiosInstance';

export async function createClientService(formData) {
    const { data } = await axiosInstance.post('/api/sales-dashboard/client/create', formData);
    return data;
}

export async function getClientService(id, page = 1, limit = 20, search = '', isPaid = false, category = '', dateFrom = '', dateTo = '') {
    const { data } = await axiosInstance.get(`/api/sales-dashboard/client/get/${id}`, {
        params: {
            page,
            limit,
            search,
            ...(isPaid && { isPaid: true }),
            ...(category?.trim() && { category: category.trim() }),
            ...(dateFrom && { dateFrom }),
            ...(dateTo && { dateTo }),
        },
    });

    return data;
}
