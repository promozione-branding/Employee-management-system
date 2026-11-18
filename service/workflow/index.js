// service/workflow/index.js

import axiosInstance from '../axiosInstance';

export async function createWorkflowService(payload) {
    try {
        const { data } = await axiosInstance.post('/api/workflow/create', payload);
        return data;
    } catch (error) {
        throw new Error(error?.response?.data?.message || error.message || 'Failed to create workflow');
    }
}

export async function listWorkflowsService(customerId) {
    try {
        const { data } = await axiosInstance.get(`/api/workflow?customerId=${customerId}`);
        return data;
    } catch (error) {
        throw new Error(error?.response?.data?.message || error.message || 'Failed to load workflows');
    }
}

export async function deleteWorkflowService(id) {
    try {
        const { data } = await axiosInstance.delete(`/api/workflow/${id}`);
        return data;
    } catch (error) {
        throw new Error(error?.response?.data?.message || error.message || 'Failed to delete workflow');
    }
}

// 👇 NEW
export async function updateWorkflowService(id, payload) {
    try {
        const { data } = await axiosInstance.put(`/api/workflow/${id}`, payload);
        return data;
    } catch (error) {
        throw new Error(error?.response?.data?.message || error.message || 'Failed to update workflow');
    }
}
