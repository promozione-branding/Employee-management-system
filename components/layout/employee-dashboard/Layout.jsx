"use client";

import { createContext, useContext, useEffect, useState } from "react";
import EmployeeSidebar from "./EmployeeSidebar";
import EmployeeNavbar from "./EmployeeNavbar";
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
  const [open, setOpen] = useState(false);

  return (
    <EmployeeProvider>
      <div className="flex min-h-screen bg-gray-100">
        <EmployeeSidebar open={open} setOpen={setOpen} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <EmployeeNavbar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </EmployeeProvider>
  );
};

export default Layout;
