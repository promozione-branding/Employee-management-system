// service/customer/brandAssets.js

import axios from "axios"; // adjust if you use fetch wrapper

const api = axios.create({ baseURL: "/api" });

export async function getBrandAssets(clientId) {
  const res = await api.get(`/customer/brand-assets/${clientId}`);
  return res.data; // { success, data, canEdit }
}

export async function updateBrandAssets(clientId, payload) {
  const res = await api.put(`/customer/brand-assets/${clientId}`, payload);
  return res.data;
}

export async function uploadBrandAsset(file, folder = "brand-assets") {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", folder);
  const res = await api.post(`/customer/brand-assets/upload`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data; // { success, url }
}
