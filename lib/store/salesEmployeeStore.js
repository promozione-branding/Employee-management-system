import { getEmployeeDetailsService } from "@/service/employee-dashboard/employee";
import { create } from "zustand";

export const useSalesEmployeeStore = create((set) => ({
  employee: null,
  loading: true,

  fetchEmployee: async () => {
    try {
      const cached = sessionStorage.getItem("employeeData");
      if (cached) {
        set({ employee: JSON.parse(cached), loading: false });
        return;
      }

      const res = await getEmployeeDetailsService();

      if (res?.success) {
        set({ employee: res.data });
        sessionStorage.setItem("employeeData", JSON.stringify(res.data));
      } else {
        set({ employee: null });
      }
    } catch (error) {
      console.error("Employee fetch failed", error);
      set({ employee: null });
    } finally {
      set({ loading: false });
    }
  },

  clearEmployee: () =>
    set({
      employee: null,
      loading: false,
    }),
}));
