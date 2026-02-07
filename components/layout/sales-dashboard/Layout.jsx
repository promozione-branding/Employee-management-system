"use client";

import { createContext, useContext, useEffect, useState } from "react";
import SalesSidebar from "./SalesSidebar";
import SalesNavbar from "./SalesNavbar";
import { getEmployeeDetailsService } from "@/service/employee-dashboard/employee";
import toast from "react-hot-toast";

const EmployeeContext = createContext(null);

export function EmployeeProvider({ children }) {
  const [basicEmployeeData, setBasicEmployeeData] = useState({});

  useEffect(() => {
    async function getEmployeeDetails() {
      try {
        const res = await getEmployeeDetailsService();
        if (res.success) {
          setBasicEmployeeData(res.data);
          sessionStorage.setItem("employeeData", JSON.stringify(res.data));
          toast.success("employee details fetched");
        }
      } catch (error) {
        console.log(error);
        toast.error("error while getting employee details");
      }
    }
    getEmployeeDetails();
  }, []);

  return (
    <EmployeeContext.Provider value={{ basicEmployeeData }}>
      {children}
    </EmployeeContext.Provider>
  );
}

export const useEmployee = () => useContext(EmployeeContext);

const Layout = ({ children }) => {
  const [open, setOpen] = useState(true);

  return (
    <EmployeeProvider>
      <div className="flex min-h-screen bg-gray-100">
        <SalesSidebar open={open} setOpen={setOpen} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <SalesNavbar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </EmployeeProvider>
  );
};

export default Layout;
