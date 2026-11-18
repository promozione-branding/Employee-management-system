// service/workflow/index.js

import axiosInstance from '../axiosInstance';

/**
 * Create a new workflow 
 */
export async function createWorkflowService(payload) {
    try {
        const { data } = await axiosInstance.post('/api/workflow/create', payload);
        return data;
    } catch (error) {
        // Re-throw the API error message so the UI toast shows it
        throw new Error(error?.response?.data?.message || error.message || 'Failed to create workflow');
    }
}

/**
 * List workflows for a specific customer
 */
export async function listWorkflowsService(customerId) {
    try {
        const { data } = await axiosInstance.get(`/api/workflow?customerId=${customerId}`);
        return data;
    } catch (error) {
        throw new Error(error?.response?.data?.message || error.message || 'Failed to load workflows');
    }
}

/**
 * Delete a workflow by ID
 */
export async function deleteWorkflowService(id) {
    try {
        const { data } = await axiosInstance.delete(`/api/workflow/${id}`);
        return data;
    } catch (error) {
        throw new Error(error?.response?.data?.message || error.message || 'Failed to delete workflow');
    }
}
