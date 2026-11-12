// app/dashboard/employee/employee-details/edit-basic-details/[id]/EditBasicDetail.jsx


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

  const [formData, setFormData] = useState(
    initialEmployeesBasicDetailsEdit
  );

  const employeeBasicDetailsFormControl =
    editEmployeeBasicDetailsFormControl(formData.designation);

  // Handle form changes
  function handleFormDataChange(nextFormData) {
    const isDesignationChanged =
      nextFormData.designation !== formData.designation;

    if (!isDesignationChanged) {
      setFormData(nextFormData);
      return;
    }

    const hasValidSubDesignation = getSubDesignationOptions(
      nextFormData.designation
    ).some(
      (option) => option.id === nextFormData.subDesignation
    );

    setFormData({
      ...nextFormData,
      subDesignation: hasValidSubDesignation
        ? nextFormData.subDesignation
        : "",
    });
  }

  // Format date for HTML date inputs
  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "";

    return parsedDate.toISOString().split("T")[0];
  };

  // Fetch employee details and populate the form
  async function getEmployeeDetails() {
    try {
      setEmployeeDetailLoading(true);

      const res = await getEmployeeBasicDetailsAdminService(employeeId);

      if (res?.success) {
        const details = res?.data?.basicDetails || {};

        const formattedDetails = {
          ...details,
          dob: formatDate(details.dob),
          joiningDate: formatDate(details.joiningDate),
        };

        // Store employee details for the left-side preview
        setGetEmployeeDetailsData(formattedDetails);

        // IMPORTANT: Populate the edit form with fetched employee details
        const populatedFormData = Object.keys(
          initialEmployeesBasicDetailsEdit
        ).reduce((newFormData, key) => {
          newFormData[key] =
            formattedDetails[key] ??
            initialEmployeesBasicDetailsEdit[key] ??
            "";

          return newFormData;
        }, {});

        setFormData(populatedFormData);
      } else {
        toast.error(res?.message || "Unable to fetch employee details");
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);

      toast.error(
        error?.response?.data?.message ||
          "Error while fetching employee details"
      );
    } finally {
      setEmployeeDetailLoading(false);
    }
  }

  // Submit updated employee details
  async function handleSubmit(e) {
    e.preventDefault();

    const editFormTemplate = Object.keys(formData).reduce(
      (newObj, key) => {
        const value = formData[key];

        if (value !== "" && value !== null && value !== undefined) {
          newObj[key] = value;
        }

        return newObj;
      },
      {}
    );

    try {
      const res = await editEmployeeBasicDetailsAdminService(
        employeeId,
        editFormTemplate
      );

      if (res?.success) {
        toast.success("Employee details updated successfully");

        // Update the displayed employee details without clearing the form
        setGetEmployeeDetailsData((previous) => ({
          ...previous,
          ...editFormTemplate,
        }));
      }
    } catch (error) {
      console.error("Error updating employee details:", error);

      toast.error(
        error?.response?.data?.message ||
          "Error while updating employee details"
      );
    }
  }

  // Fetch details whenever employeeId changes
  useEffect(() => {
    if (!employeeId) return;

    getEmployeeDetails();
  }, [employeeId]);

  return (
    <div className="flex flex-col gap-8 lg:flex-row">

      {/* Employee Details Preview */}
      <div className="w-full rounded-lg bg-white p-4 shadow-md lg:w-1/2">

        <h2 className="mb-4 text-2xl font-bold text-gray-800">
          Employee Details
        </h2>

        {employeeDetailLoading ? (
          <p className="text-sm text-gray-500">
            Loading employee details...
          </p>
        ) : (
          <div className="space-y-3">

            {Object.entries(getEmployeeDetailsData).map(
              ([key, value]) => {
                const formattedKey = key.replace(
                  /([A-Z])/g,
                  " $1"
                );

                const label =
                  key === "designation"
                    ? "Department"
                    : key === "subDesignation"
                      ? "Sub Department"
                      : key === "authRole"
                        ? "Designation"
                        : formattedKey;

                return (
                  <div
                    key={key}
                    className="flex flex-col gap-1 border-b py-2 sm:flex-row"
                  >
                    <p className="w-full font-semibold capitalize text-gray-600 sm:w-1/3">
                      {label}:
                    </p>

                    <p className="w-full break-words text-gray-800 sm:w-2/3">
                      {value instanceof Date
                        ? formatDate(value)
                        : String(value ?? "-")}
                    </p>
                  </div>
                );
              }
            )}

          </div>
        )}
      </div>

      {/* Edit Employee Form */}
      <div className="w-full lg:w-1/2">

        <p className="py-2 text-2xl font-bold text-gray-600">
          Edit Employee Details
        </p>

        {employeeDetailLoading ? (
          <p className="text-sm text-gray-500">
            Preparing edit form...
          </p>
        ) : (
          <GridForm
            formControls={employeeBasicDetailsFormControl}
            formData={formData}
            setFormData={handleFormDataChange}
            onSubmit={handleSubmit}
            buttonText="Edit Profile"
          />
        )}

      </div>
    </div>
  );
};

export default EditBasicDetail;
