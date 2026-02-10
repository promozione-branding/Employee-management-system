import { create } from "zustand";

export const useSalesEmployeeStore = create((set) => ({
  employee: null,
  loading: true,

  setEmployee: (employee) =>
    set({
      employee,
      loading: false,
    }),

  clearEmployee: () =>
    set({
      employee: null,
      loading: false,
    }),
}));
