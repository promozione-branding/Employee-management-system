"use client";

import GridForm from "@/components/layout/GridForm";
import { editEmployeeBasicDetailsFormControl } from "@/config/data";
import { getSubDesignationOptions } from "@/config/employeeDesignation";
import { initialEmployeesBasicDetailsEdit } from "@/config/initialFormDate";
import {
  editEmployeeBasicDetailsAdminService,
  getEmployeeBasicDetailsAdminService,
} from "@/service/admin-dashboard/employee/employee-basic-details";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const EditBasicDetail = ({ employeeId }) => {
  const [employeeDetailLoading, setEmployeeDetailLoading] = useState(true);
  const [getEmployeeDetailsData, setGetEmployeeDetailsData] = useState({});
  const [formData, setFormData] = useState(initialEmployeesBasicDetailsEdit);

  const employeeBasicDetailsFormControl = editEmployeeBasicDetailsFormControl(
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

  async function getEmployeeDetails() {
    try {
      const res = await getEmployeeBasicDetailsAdminService(employeeId);
      if (res.success) {
        const details = res?.data?.basicDetails;
        // The dates from backend are strings, format them for date input
        const formattedDetails = {
          ...details,
          dob: details.dob
            ? new Date(details.dob).toISOString().split("T")[0]
            : "",
          joiningDate: details.joiningDate
            ? new Date(details.joiningDate).toISOString().split("T")[0]
            : "",
        };
        setEmployeeDetailLoading(false);
        setGetEmployeeDetailsData(formattedDetails);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const editFormTemplate = Object.keys(formData).reduce((newObj, key) => {
      const value = formData[key];
      if (value) {
        newObj[key] = value;
      }
      return newObj;
    }, {});

    try {
      const res = await editEmployeeBasicDetailsAdminService(
        employeeId,
        editFormTemplate,
      );

      if (res.success) {
        setFormData(initialEmployeesBasicDetailsEdit);
        toast.success("Employee details Edit successfully");
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Error while create employee",
      );
    }
  }

  useEffect(() => {
    if (!employeeId) return;
    getEmployeeDetails();
  }, [employeeId]);

  return (
    <div className="flex gap-8 ">
      {/* here is the employee details  */}
      <div className="lg:w-1/2 bg-white p-1 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-1 text-gray-800">
          Employe Details
        </h2>
        {employeeDetailLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(getEmployeeDetailsData).map(([key, value]) => (
              <div key={key} className="flex border-b py-1">
                <p className="font-semibold text-gray-600 capitalize w-1/3">
                  {key.replace(/([A-Z])/g, " $1") === "designation"
                    ? "Department"
                    : key.replace(/([A-Z])/g, " $1") === "sub Designation"
                      ? "sub Department"
                      : key.replace(/([A-Z])/g, " $1") === "auth Role"
                        ? "Designation"
                        : key.replace(/([A-Z])/g, " $1")}
                  :
                </p>
                <p className="text-gray-800 w-2/3">{String(value)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* edit form  */}
      <div className="lg:w-1/2">
        <p className="text-2xl py-2 font-bold text-gray-600">
          Edit Employe Details
        </p>
        <GridForm
          formControls={employeeBasicDetailsFormControl}
          formData={formData}
          setFormData={handleFormDataChange}
          onSubmit={handleSubmit}
          buttonText="Edit Profile"
        />
      </div>
    </div>
  );
};

export default EditBasicDetail;
