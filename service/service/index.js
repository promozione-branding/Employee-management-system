// service/service/index.js

import toast from "react-hot-toast";
import axiosInstance from "../axiosInstance";

export async function createServicesService(formData) {
  const { data } = await axiosInstance.post("/api/service/add", formData);
  return data;
}

export async function getAllService() {
  const { data } = await axiosInstance.get("/api/service/getAllService");
  return data;
}

export async function fetchProposalServiceById(id) {
  try {
    const { data } = await axiosInstance.get(`/api/service/${id}`);
    if (data.success) {
      return data;
    }
  } catch (error) {
    console.log("Error while fetching Proposal service by id", error);
    toast.error(error.message);
  }
}

export async function editService(id, formData) {
  try {
    const { data } = await axiosInstance.put(`/api/service/${id}`, formData);
    if (data.success) {
      toast.success(data.message || "Service edited successfully");
      return data;
    }
  } catch (error) {
    console.log("Error while editing service by id", error);
    toast.error(error.message);
  }
}

export async function deleteService(id) {
  try {
    const { data } = await axiosInstance.delete(`/api/service/${id}`);
    if (data.success) {
      toast.success(data.message || "Service delete successfully");
      return data;
    }
  } catch (error) {
    console.log("Error while deleting service by id", error);
    toast.error(error.message);
  }
}
