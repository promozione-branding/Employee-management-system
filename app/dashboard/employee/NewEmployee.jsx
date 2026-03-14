"use client";

import GridForm from "@/components/layout/GridForm";
import Loading from "@/components/layout/Loading";
import {
  createEmployeeProfile,
  newEmployeeListService,
} from "@/service/employee-dashboard/employee";
import { SmilePlus } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getEmployeeBasicDetailsFormControl } from "@/config/data";
import { getSubDesignationOptions } from "@/config/employeeDesignation";
import { initialEmployeesBasicDetails } from "@/config/initialFormDate";

const NewEmployee = () => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [newEmployeeList, setNewEmployeeList] = useState([]);
  const [formData, setFormData] = useState(initialEmployeesBasicDetails);
  const employeeBasicDetailsFormControl = getEmployeeBasicDetailsFormControl(
    formData.designation,
  );

  function handleFormDataChange(nextFormData) {
    const isDesignationChanged =
      nextFormData.designation !== formData.designation;
    if (!isDesignationChanged) {
      setFormData(nextFormData);
      return;
    }

    const hasValidSubDesignation = getSubDesignationOptions(
      nextFormData.designation,
    ).some((option) => option.id === nextFormData.subDesignation);

    setFormData({
      ...nextFormData,
      subDesignation: hasValidSubDesignation ? nextFormData.subDesignation : "",
    });
  }

  async function fetchNewEmployee() {
    try {
      const res = await newEmployeeListService();
      if (res.success) {
        setLoading(false);
        setNewEmployeeList(res?.data);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error while fetch new employee");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (
      !formData.employeeId ||
      !formData.name ||
      !formData.designation ||
      !formData.subDesignation ||
      !formData.authRole ||
      !formData.phone ||
      !formData.address ||
      !formData.email ||
      !formData.dob ||
      !formData.gender ||
      !formData.joiningDate
    ) {
      toast.error("All fields are required");
      return;
    }

    const formDataValue = {
      employeeId: formData?.employeeId,
      user: userId,
      basicDetails: {
        ...formData,
      },
    };
    try {
      const res = await createEmployeeProfile(formDataValue);
      if (res.success) {
        setFormData(initialEmployeesBasicDetails);
        fetchNewEmployee();
        toast.success("Employee details added successfully");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error while create employee");
    }
  }

  useEffect(() => {
    fetchNewEmployee();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="mt-5 grid gap-4 grid-cols-3">
      {newEmployeeList && newEmployeeList.length > 0 ? (
        newEmployeeList.map((item) => (
          <div
            key={item._id}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow"
          >
            <div>
              <h3 className="font-semibold text-gray-800">{item.username?.split("@")[0]}</h3>
              <p className="text-sm text-gray-500">{item.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-full bg-blue-50 text-blue-600 text-xs font-medium capitalize">
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      onClick={() => setUserId(item._id)}
                      className="rounded-xl"
                    >
                      <SmilePlus />
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader className={"hidden"}>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove your data from our
                        servers.
                      </DialogDescription>
                    </DialogHeader>
                    <div>
                      <p className="text-center mb-4 text-xl">
                        Add Employee Details
                      </p>
                      <GridForm
                        formControls={employeeBasicDetailsFormControl}
                        formData={formData}
                        setFormData={handleFormDataChange}
                        onSubmit={handleSubmit}
                        buttonText="Create Profile"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center p-8 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">No new employees found</p>
        </div>
      )}
    </div>
  );
};

export default NewEmployee;
