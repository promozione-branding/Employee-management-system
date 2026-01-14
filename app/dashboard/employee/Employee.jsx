"use client";
import { UserRoundPlus } from "lucide-react";
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
import { initialEmployeeRegisterFormData } from "@/config/initialFormDate";
import toast from "react-hot-toast";
import { registerService } from "@/service/auth";
import { getAllEmployeeForDashboard } from "@/service/employee-dashboard/employee";
import Loading from "@/components/layout/Loading";

const Employee = () => {
  const [formData, setFormData] = useState(initialEmployeeRegisterFormData);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [employeeLoading, setEmployeeLoading] = useState(true);

  async function handleRegister(e) {
    e.preventDefault();

    if (
      !formData.email ||
      !formData.password ||
      !formData.username ||
      !formData?.role
    ) {
      toast.error("Please enter both email and password. also role");
      return;
    }

    if (formData?.email?.split("@")[1] !== "promozionebranding.com") {
      toast.error("Only official company email is supported.");
      return;
    }

    if (formData?.password?.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await registerService(formData);

      if (data.success) {
        toast.success(data.message || "Employee add successfully");
        setFormData(initialEmployeeRegisterFormData);
        setOpenDialog(false);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Error while creating the Employee");
      setLoading(false);
    }
  }

  async function fetchEmployees() {
    try {
      const res = await getAllEmployeeForDashboard();
      console.log(res);
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

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div>
      {employeeLoading ? (
       <Loading />
      ) : (
        <div className="mt-6 bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
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
                      {employee.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.email}
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
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
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
          <p className="font-bold text-2xl text-center">Add Employee</p>
          <CommonForm
            formControls={employeeRegisterFormControl}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleRegister}
            buttonText={"Add"}
            isBtnDisabled={loading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Employee;
