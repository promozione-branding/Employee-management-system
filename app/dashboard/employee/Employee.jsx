"use client";
import { IdCard, Trash2, UserRoundPen, UserRoundPlus } from "lucide-react";
import { useEffect, useState } from "react";
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

    if (registerFormData?.email?.split("@")[1] !== "promozionebranding.com") {
      toast.error("Only official company email is supported.");
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
    }
  }

  async function fetchEmployees() {
    try {
      const res = await getAllEmployee();
      if (res.success) {
        setEmployeeList(res.data);
        setEmployeeLoading(false);
      }
    } catch (error) {
      console.log(error);
      setEmployeeList([]);
      toast.error(error.message || "Error while fetching the employee");
    }
  }

  async function handleResignedEmployee(id) {
    try {
      const res = await resignedEmployeeAdminService(id);
      console.log(res,"res");
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

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div>
      {employeeLoading ? (
        <Loading />
      ) : (
        <div className="flex w-full ">
          <Tabs defaultValue="employee" className="w-[90vw]">
            <TabsList>
              <TabsTrigger value="employee">Employe</TabsTrigger>
              <TabsTrigger value="user">New Employe</TabsTrigger>
              <TabsTrigger value="announcement">Announcement</TabsTrigger>
            </TabsList>
            <TabsContent value="employee" className={""}>
              <div className="mt-6 bg-white shadow-sm rounded-lg ">
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employeeList && employeeList.length > 0 ? (
                      employeeList.map((employee) => (
                        <tr key={employee._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {employee.employeeId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {employee?.basicDetails?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {employee?.basicDetails?.designation}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {employee?.basicDetails?.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm flex items-center gap-8">
                            <button
                              onClick={() =>
                                handleResignedEmployee(employee._id)
                              }
                            >
                              <Trash2 />
                            </button>
                            <Link
                              href={`/dashboard/employee/employee-details/edit-basic-details/${employee._id}`}
                            >
                              <UserRoundPen />
                            </Link>
                            <Link
                              href={`/dashboard/employee/employee-details/${employee._id}`}
                            >
                              <IdCard />
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="2"
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          No employees found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
              <div className="border-2 border-blue-500 p-3 rounded-full flex items-center justify-center h-12 w-12">
                <UserRoundPlus />
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader className={"hidden"}>
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
                buttonText={"Add"}
                isBtnDisabled={loading}
              />
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* for new User  */}
      {/* <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger asChild>
          <div className="absolute bottom-20 right-20 border-2 border-black p-3 rounded-full flex items-center justify-center">
            <UserRoundPlus />
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader className={"hidden"}>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <p className="font-bold text-2xl text-center">Add User</p>
          <CommonForm
            formControls={employeeRegisterFormControl}
            formData={registerFormData}
            setFormData={setRegisterFormData}
            onSubmit={handleRegister}
            buttonText={"Add"}
            isBtnDisabled={loading}
          />
        </DialogContent>
      </Dialog> */}
    </div>
  );
};

export default Employee;
