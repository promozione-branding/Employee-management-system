import axiosInstance from "@/service/axiosInstance";

export async function getAllEmployeeForDashboard() {
    const {data} = await axiosInstance.get("/api/employee/user-employee");
    return data
}