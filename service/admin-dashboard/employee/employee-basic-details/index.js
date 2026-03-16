import axiosInstance from "@/service/axiosInstance";

export async function editEmployeeBasicDetailsAdminService(id, formData) {
  const { data } = await axiosInstance.put(
    `/api/employee/edit-basic-details/${id}`,
    formData,
  );

  return data;
}

export async function getEmployeeBasicDetailsAdminService(id) {
  const { data } = await axiosInstance.get(
    `/api/employee/get-basic-details/${id}`,
  );

  return data;
}


export async function resignedEmployeeAdminService(id) {
  const { data } = await axiosInstance.patch(
    `/api/employee/resign-delete-employee/${id}`,
  );

  return data;
}
