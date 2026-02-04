import axiosInstance from "@/service/axiosInstance";

export async function createTodoService(formData) {
  const { data } = await axiosInstance.post(
    "/api/employee-dashboard/todo/create",
    formData,
  );
  return data;
}

export async function editTodoService(id, formData) {
  const { data } = await axiosInstance.patch(
    `/api/employee-dashboard/todo/${id}`,
    formData,
  );
  return data;
}

export async function deleteTodoService(id) {
  const { data } = await axiosInstance.delete(
    `/api/employee-dashboard/todo/${id}`,
  );

  return data;
}

export async function getTodoService(id) {
  const { data } = await axiosInstance.get(
    `/api/employee-dashboard/todo/get-todo/${id}`,
  );
  return data;
}
