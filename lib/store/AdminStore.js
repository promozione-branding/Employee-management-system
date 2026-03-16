import { getAdminDetailService } from "@/service/admin-dashboard/dashboard-api";
import { create } from "zustand";


export const useAdminStore = create((set) => ({
  adminDetail: null,
  loading: true,

  fetchAdminDetails: async () => {
    try {
      const cached = sessionStorage.getItem("adminDetail");
      if (cached) {
        set({ adminDetail: JSON.parse(cached), loading: false });
        return;
      }

      const res = await getAdminDetailService();
      if (res?.success) {
        set({ adminDetail: res.data });
        sessionStorage.setItem("adminDetail", JSON.stringify(res.data));
      } else {
        set({ adminDetail: null });
      }
    } catch (error) {
      console.error("adminDetail fetch failed", error);
      set({ adminDetail: null });
    } finally {
      set({ loading: false });
    }
  },

  clearEmployee: () =>
    set({
      adminDetail: null,
      loading: false,
    }),
}));