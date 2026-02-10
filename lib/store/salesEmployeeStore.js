import { getEmployeeDetailsService } from "@/service/employee-dashboard/employee";
import { create } from "zustand";

export const useSalesEmployeeStore = create((set) => ({
  employee: null,
  loading: true,

  fetchEmployee: async () => {
    try {
      const res = await getEmployeeDetailsService();
      if (res.success) {
        set({ employee: res.data, loading: false });
        sessionStorage.setItem("employeeData", JSON.stringify(res.data));
      } else {
        set({ employee: null, loading: false });
      }
    } catch (error) {
      set({ employee: null, loading: false });
    }
  },

  clearEmployee: () =>
    set({
      employee: null,
      loading: false,
    }),
}));
