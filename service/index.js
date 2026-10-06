// service/index.js

import axiosInstance from "./axiosInstance";

export async function createProposelService(formData) {
  const { data } = await axiosInstance.post("/api/proposals/create", formData);
  return data;
}

export async function getAllProposals() {
  const { data } = await axiosInstance.get("/api/proposals/get-all-proposal");
  return data;
}

export async function getProposalById(id) {
  const { data } = await axiosInstance.get(`/api/proposals/${id}`);
  return data;
}