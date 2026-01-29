import axiosInstance from "@/service/axiosInstance";

export async function getProposalDetail(id) {
  const { data } = await axiosInstance.get(
    `/api/customer/propsals/proposal-edit/get-proposal/${id}`,
  );

  return data;
}

export async function editProposalService(id, formData) {
  const { data } = await axiosInstance.put(
    `/api/customer/propsals/proposal-edit/get-proposal/${id}`,
    formData,
  );

  return data;
}
