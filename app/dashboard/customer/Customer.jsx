"use client";
import CommonForm from "@/components/layout/Form";
import { projectDurationFormControl } from "@/config/data";
import {
  createCustomerProjectCycleService,
  deleteCustomerProjectCycleService,
  getCustomerProjectCycleService,
  getCustomerServices,
  updateCustomerProjectCycleService,
} from "@/service/customer";
import { Pencil, Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Customer = ({ customerId }) => {
  const [customerDetails, setCustomerDetails] = useState(null);
  const [projectCycleData, setProjectCycleData] = useState(null);
  const [loadingProjectCycle, setLoadingProjectCycle] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);

  const [projectFormData, setProjectFormData] = useState({
    service: "",
    serviceName: "",
    "start-date": "",
    "end-date": "",
  });

  const handleProjectSubmit = async (e) => {
    e.preventDefault();

    try {
      const serviceValue =
        projectFormData.service === "other"
          ? projectFormData.serviceName
          : projectFormData.service;

      if (currentEditedId) {
        const updatedProjectDuration =
          projectCycleData?.projectCycle?.projectDuration?.map((item) =>
            item._id === currentEditedId
              ? {
                  ...item,
                  service: serviceValue,
                  startDate: projectFormData["start-date"],
                  endDate: projectFormData["end-date"],
                }
              : item
          );

        const res = await updateCustomerProjectCycleService(
          projectCycleData?.projectCycle?._id,
          {
            projectDuration: updatedProjectDuration,
          }
        );

        if (res.success) {
          toast.success("Project details updated");
          setProjectFormData({
            service: "",
            serviceName: "",
            "start-date": "",
            "end-date": "",
          });
          setCurrentEditedId(null);
          fetchCustomerProjectCycle();
        }
      } else {
        const formData = {
          clientId: customerId,
          service: serviceValue,
          "start-date": projectFormData["start-date"],
          "end-date": projectFormData["end-date"],
        };

        const res = await createCustomerProjectCycleService(formData);
        if (res.success) {
          toast.success("Project details submitted");
          setProjectFormData({
            service: "",
            serviceName: "",
            "start-date": "",
            "end-date": "",
          });
          fetchCustomerProjectCycle();
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Error while processing project cycle");
    }
  };

  async function fetchCustomerProjectCycle() {
    try {
      const response = await getCustomerProjectCycleService(customerId);
      console.log(response);
      if (response.success) {
        setLoadingProjectCycle(true);
        toast.success("Customer project duration fetched");
        setProjectCycleData(response.data);
      }
    } catch (error) {
      setLoadingProjectCycle(false);
      console.log(error);
      toast.error(error.message);
    }
  }

  const fetchCurrentCustomer = async () => {
    try {
      const response = await getCustomerServices(customerId);
      console.log(response, "response");
      if (response.success) {
        toast.success("Customer details fetched");
        setCustomerDetails(response.data);
      }
    } catch (error) {
      console.log(error, "hello error");
      toast.error(error?.response?.data?.message);
    }
  };

  // edit
  async function handleEditChange(data) {
    setProjectFormData({
      service: data.service,
      serviceName: data.service,
      "start-date": data.startDate
        ? new Date(data.startDate).toISOString().split("T")[0]
        : "",
      "end-date": data.endDate
        ? new Date(data.endDate).toISOString().split("T")[0]
        : "",
    });
    setCurrentEditedId(data._id);
  }

  // delete
  async function handleDelete(id) {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!isConfirmed) return;

    try {
      const res = await deleteCustomerProjectCycleService(id);
      if (res.success) {
        toast.success("Project deleted successfully");
        fetchCustomerProjectCycle();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Error while deleting project");
    }
  }

  // edit
  async function handleProjectUpdate(e, id) {
    e.preventDefault();
    console.log(id);
  }

  useEffect(() => {
    fetchCurrentCustomer();
    fetchCustomerProjectCycle();
  }, []);

  if (!customerDetails) {
    return <div>Loading...</div>;
  }

  const {
    name,
    company,
    GSTIN,
    phone,
    website,
    Address,
    city,
    state,
    pincode,
    country,
    meetingDate,
    tanNo,
    email,
    SalesPersonName,
  } = customerDetails;

  return (
    <div className="flex gap-5">
      <div className="border p-4 flex flex-col w-[30vw] rounded-lg">
        <h2 className="text-xl font-semibold mb-2">{name}</h2>
        <p className="my-2">
          <strong>Company:</strong> {company}
        </p>
        <p className="my-2">
          <strong>GSTIN:</strong> {GSTIN}
        </p>
        <p className="my-2">
          <strong>TAN No:</strong> {tanNo || "NA"}
        </p>
        <p className="my-2">
          <strong>Email:</strong> {email}
        </p>
        <p className="my-2">
          <strong>Phone:</strong> {phone}
        </p>
        <p className="my-2">
          <strong>Website:</strong> {website}
        </p>
        <p className="my-2">
          <strong>SalesPersonName:</strong> {SalesPersonName}
        </p>
        <p className="my-2">
          <strong>Address:</strong> {Address}, {city}, {state} - {pincode},{" "}
          {country}
        </p>
        <p className="my-2">
          <strong>Meeting Date:</strong>{" "}
          {new Date(meetingDate).toLocaleDateString()}
        </p>
      </div>

      <div>
        <div className="w-[30vw] border p-4 rounded-lg">
          <p className="font-semibold text-lg mb-4">Add Project</p>
          <CommonForm
            formControls={
              projectFormData.service === "other"
                ? [
                    projectDurationFormControl[0],
                    {
                      label: "Service Name",
                      name: "serviceName",
                      componentType: "input",
                      type: "text",
                      placeholder: "Enter Service Name",
                    },
                    ...projectDurationFormControl.slice(1),
                  ]
                : projectDurationFormControl
            }
            formData={projectFormData}
            setFormData={setProjectFormData}
            buttonText={currentEditedId ? "Update Project" : "Save Project"}
            onSubmit={
              currentEditedId ? handleProjectUpdate : handleProjectSubmit
            }
          />
          {currentEditedId && (
            <button
              onClick={() => {
                setCurrentEditedId(null);
                setProjectFormData({
                  service: "",
                  serviceName: "",
                  "start-date": "",
                  "end-date": "",
                });
              }}
              className="mt-2 w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      <div className="w-[20vw] border p-4 rounded-lg">
        <p className="font-semibold text-xl mb-4">Service</p>
        <div className="flex flex-col gap-3 h-[400px] overflow-y-auto">
          {projectCycleData?.projectCycle?.projectDuration?.length > 0 ? (
            projectCycleData?.projectCycle?.projectDuration?.map(
              (item, idx) => (
                <div key={idx} className="bg-gray-100 p-3 rounded-md border-b">
                  <p className="font-semibold capitalize">{item?.service}</p>
                  <div className="text-sm mt-1">
                    <p>
                      Start Date:{" "}
                      {new Date(item?.["startDate"]).toLocaleDateString()}
                    </p>
                    <p>
                      End Date:{" "}
                      {new Date(item?.["endDate"]).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex justify-between mt-2">
                    <button
                      onClick={() => handleEditChange(item)}
                      className="h-8 w-8 bg-blue-500 flex items-center justify-center rounded-full"
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(item?._id)}
                      className="h-8 w-8 bg-red-500 flex items-center justify-center rounded-full"
                    >
                      <Trash size={20} />
                    </button>
                  </div>
                </div>
              )
            )
          ) : (
            <p className="text-center text-gray-500 mt-10">
              No Project History Found
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Customer;
