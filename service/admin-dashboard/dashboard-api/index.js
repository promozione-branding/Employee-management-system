import axiosInstance from "@/service/axiosInstance";

export async function myClientService() {
  const { data } = await axiosInstance.get(
    "/api/admin-dashboard-api/my-clients",
  );

  return data;
}

export async function allClientCountService() {
  const { data } = await axiosInstance.get(
    "/api/admin-dashboard-api/all-client-count",
  );

  return data;
}

export async function allEmployeeService(){
  const { data } = await axiosInstance.get(
    "/api/admin-dashboard-api/total-employee",
  );

  return data;
}

export async function teamMemberService(){
  const { data } = await axiosInstance.get(
    "/api/admin-dashboard-api/team-members",
  );

  return data;
}
