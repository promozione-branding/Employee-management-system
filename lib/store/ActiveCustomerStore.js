// lib/store/ActiveCustomerStore.js

import { create } from "zustand";

export const useActiveCustomerStore = create((set) => ({
  activeCustomer: null,
  setActiveCustomer: (customer) => set({ activeCustomer: customer }),
  clearActiveCustomer: () => set({ activeCustomer: null }),
}));
