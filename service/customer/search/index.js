// service/customer/search/index.js

import axiosInstance from '@/service/axiosInstance';

export async function searchClientService(query, page = 1, isPaid, category) {
    const params = { q: query, page, limit: 20 };

    if (isPaid) {
        params.isPaid = true;
    }
    if (category?.trim()) {
        params.category = category.trim();
    }

    const { data } = await axiosInstance.get('/api/customer/search', { params });

    return data;
}
