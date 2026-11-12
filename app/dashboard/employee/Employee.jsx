
// app/dashboard/employee/Employee.jsx

"use client";

import {
  IdCard,
  Trash2,
  UserRoundPen,
  UserRoundPlus,
  Search,
  X,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import CommonForm from "@/components/layout/Form";
import { employeeRegisterFormControl } from "@/config/data";

import {
  initialEmployeeRegisterFormData,
  initialEmployeesBasicDetails,
} from "@/config/initialFormDate";

import toast from "react-hot-toast";
import { createUserService } from "@/service/auth";

import {
  checkEmployeeExists,
  createEmployeeProfile,
  getAllEmployee,
} from "@/service/employee-dashboard/employee";

import Loading from "@/components/layout/Loading";
import { useRouter } from "next/navigation";
import GridForm from "@/components/layout/GridForm";
import Link from "next/link";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import NewEmployee from "./NewEmployee";
import Announcement from "./annoucement/page";

import { resignedEmployeeAdminService } from "@/service/admin-dashboard/employee/employee-basic-details";

const Employee = () => {
  const [registerFormData, setRegisterFormData] = useState(
    initialEmployeeRegisterFormData,
  );

  const [formData, setFormData] = useState(initialEmployeesBasicDetails);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [employeeLoading, setEmployeeLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState("");

  // Employee search state
  const [searchTerm, setSearchTerm] = useState("");

  const router = useRouter();

  async function handleRegister(e) {
    e.preventDefault();

    if (
      !registerFormData.email ||
      !registerFormData.password ||
      !registerFormData.username ||
      !registerFormData?.role
    ) {
      toast.error("Please enter both email and password. also role");
      return;
    }

    if (registerFormData?.password?.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await createUserService(registerFormData);

      if (res.success) {
        toast.success(res?.message || "Employee add successfully");
        setRegisterFormData(initialEmployeeRegisterFormData);
        setOpenDialog(false);
        fetchEmployees();
      }
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message || "Error while creating the Employee",
      );

      setLoading(false);
    } finally {
      setLoading(false);
    }
  }

  async function fetchEmployees() {
    try {
      const res = await getAllEmployee();

      if (res.success) {
        setEmployeeList(res.data);
      }
    } catch (error) {
      console.log(error);
      setEmployeeList([]);
      toast.error(error.message || "Error while fetching the employee");
    } finally {
      setEmployeeLoading(false);
    }
  }

  async function handleResignedEmployee(id) {
    try {
      const res = await resignedEmployeeAdminService(id);

      console.log(res, "res");

      if (res.success) {
        toast.success("Employee deleted successfully");
        fetchEmployees();
      }
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message || "server error while resign employee",
      );
    }
  }

  // Filter employees by name, email, or department/designation
  const filteredEmployees = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return employeeList;

    return employeeList.filter((employee) => {
      const name = employee?.basicDetails?.name || "";
      const email = employee?.basicDetails?.email || "";
      const department = employee?.basicDetails?.department || "";
      const designation = employee?.basicDetails?.designation || "";

      return (
        name.toLowerCase().includes(search) ||
        email.toLowerCase().includes(search) ||
        department.toLowerCase().includes(search) ||
        designation.toLowerCase().includes(search)
      );
    });
  }, [employeeList, searchTerm]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div>
      {employeeLoading ? (
        <Loading />
      ) : (
        <div className="flex w-full">
          <Tabs defaultValue="employee" className="w-[90vw]">
            <TabsList>
              <TabsTrigger value="employee">Employe</TabsTrigger>
              <TabsTrigger value="user">New Employe</TabsTrigger>
              <TabsTrigger value="announcement">Announcement</TabsTrigger>
            </TabsList>

            <TabsContent value="employee" className="">
              <div className="mt-6 bg-white shadow-sm rounded-lg overflow-hidden">

                {/* Search Bar */}
                <div className="p-4 border-b border-gray-200">
                  <div className="relative w-full max-w-md">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={19}
                    />

                    <input
                      type="text"
                      placeholder="Search by employee name, email or department..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full h-11 pl-10 pr-10 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />

                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                        aria-label="Clear search"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Showing {filteredEmployees.length} of {employeeList.length} employees
                  </p>
                </div>

                {/* Employee Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employe Id
                        </th>

                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>

                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>

                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>

                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map((employee) => (
                          <tr key={employee._id} className="hover:bg-gray-50">

                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {employee.employeeId}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {employee?.basicDetails?.name}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {employee?.basicDetails?.department ||
                                employee?.basicDetails?.designation ||
                                "-"}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {employee?.basicDetails?.email}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center gap-5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleResignedEmployee(employee._id)
                                  }
                                  className="text-red-500 hover:text-red-700"
                                  title="Delete Employee"
                                >
                                  <Trash2 size={20} />
                                </button>

                                <Link
                                  href={`/dashboard/employee/employee-details/edit-basic-details/${employee._id}`}
                                  title="Edit Employee"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <UserRoundPen size={20} />
                                </Link>

                                <Link
                                  href={`/dashboard/employee/employee-details/${employee._id}`}
                                  title="Employee Details"
                                  className="text-gray-700 hover:text-black"
                                >
                                  <IdCard size={20} />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-8 text-center text-sm text-gray-500"
                          >
                            {searchTerm
                              ? `No employees found matching "${searchTerm}"`
                              : "No employees found"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="user">
              <NewEmployee />
            </TabsContent>

            <TabsContent value="announcement">
              <Announcement />
            </TabsContent>
          </Tabs>

          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <div className="border-2 border-blue-500 p-3 rounded-full flex items-center justify-center h-12 w-12 cursor-pointer">
                <UserRoundPlus />
              </div>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader className="hidden">
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </DialogDescription>
              </DialogHeader>

              <p className="font-bold text-2xl text-center">Add User</p>

              <CommonForm
                formControls={employeeRegisterFormControl}
                formData={registerFormData}
                setFormData={setRegisterFormData}
                onSubmit={handleRegister}
                buttonText="Add"
                isBtnDisabled={loading}
              />
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default Employee;
