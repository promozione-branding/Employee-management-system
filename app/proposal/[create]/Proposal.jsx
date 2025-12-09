"use client";
import CommonForm from "@/components/layout/Form";
import { ServiceFormControl, addProposalFormControl } from "@/config/data";
import {
  initalServiceFormData,
  initialPerposelFormData,
} from "@/config/initialFormDate";
import { getCustomerServices } from "@/service/customer";
import { createProposelService } from "@/service/proposal";
import {
  createServicesService,
  fetchProposalServiceById,
  editService,
  getAllService,
  deleteService,
} from "@/service/service";
import { Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Proposal = ({ customerId }) => {
  const navigate = useRouter();

  // ---------------- STATE ----------------
  const [formData, setFormData] = useState(initialPerposelFormData);
  const [servicesItem, setServicesItem] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [clientDetails, setClientDetails] = useState({});

  const { Address, GSTIN, city, company, country, name, phone, tanNo, email } =
    clientDetails;

  const [serviceFormData, setServiceFormData] = useState(initalServiceFormData);

  // ---------------- Editing state ----------------
  const [editProposalServiceId, setEditProposalServiceId] = useState(null);
  const [proposalServiceEditData, setProposalServiceEditData] = useState(
    initalServiceFormData
  );

  function calculationOfTotalAmount() {
    const totalAfterServiceDiscounts = selectedServices.reduce(
      (total, service) => {
        let servicePrice = service.amount;
        if (service.discountAmount) {
          servicePrice -= service.discountAmount;
        } else if (service.discountPercentage) {
          servicePrice -= (service.amount * service.discountPercentage) / 100;
        }

        return total + servicePrice;
      },
      0
    );
    return totalAfterServiceDiscounts
  }
  

  const propsalAllItemForm = {
    clientId: customerId,
    clientName: name,
    clientCompany: company,
    clientAddress: `${Address} -${city} -${country}`,
    GSTIN,
    tanNo: tanNo,
    services: selectedServices.map(({ _id }) => _id),
    discount: formData?.discount || 0,
    discountPercentage: formData?.discountPercentage || 0,
    validTill: formData?.validTill,
    paymentMethod: formData?.paymentMethod,
    totalAmount: calculationOfTotalAmount(),
  };

  async function fetchAllServices() {
    try {
      const response = await getAllService();
      if (response.success) {
        setServicesItem(response.data);
        toast.success("All Services Fetched");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }

  // add services
  async function handleService(e) {
    e.preventDefault();
    console.log(serviceFormData, "serviceFormData");
    try {
      if (
        !serviceFormData.serviceTitle ||
        !serviceFormData.amount ||
        !serviceFormData.duration
      ) {
        toast.error("please fill the service details");
      }

      if (
        serviceFormData.discountAmount &&
        serviceFormData.discountPercentage
      ) {
        toast.error("Can't use both discount Amount and Percentage");
        return;
      }

      if (serviceFormData.discountPercentage > 40) {
        toast.error("Discount can't be more than 40 Percentage");
        return;
      }

      if (serviceFormData.discountAmount > serviceFormData.amount) {
        toast.error("Discount can't be more than service Amount");
      }

      const response = await createServicesService(serviceFormData);
      if (response.success) {
        toast.success(response.message);
        setServiceFormData(initalServiceFormData);
        fetchAllServices();
      }
    } catch (error) {
      console.log(error);
      toast.success(error.message);
    }
  }

  async function handleProposalSubmit(e) {
    e.preventDefault();

    try {
      if (formData?.discount > 0 && formData?.discountPercentage > 0) {
        toast.error(
          "Please use either a fixed discount or a percentage, not both."
        );
        return;
      }

      if (!formData.paymentMethod || !formData.validTill) {
        toast.error(
          "Payment method and 'Valid Till' date are required to create the proposal."
        );
        return;
      }

      if (propsalAllItemForm.services.length === 0) {
        toast.error("Please add at least one service to the proposal.");
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to compare dates only
      const validTillDate = new Date(formData.validTill);

      if (validTillDate <= today) {
        toast.error("'Valid Till' date must be a future date.");
        return;
      }

      const response = await createProposelService(propsalAllItemForm);
      if (response.success) {
        toast.success("Proposal created successfully!");
        setFormData(initialPerposelFormData);
        setSelectedServices([]);
        navigate.push(`/proposal/pdf-download/${response.data._id}`);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }
  async function customerDetails() {
    try {
      const response = await getCustomerServices(customerId);
      if (response.success) {
        toast.success("customer details");
        setClientDetails(response.data);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error.message);
    }
  }

  // ---------------- Editing function ----------------
  async function getProposalServiceIdForEdit(id) {
    setEditProposalServiceId(id);

    const res = await fetchProposalServiceById(id);
    if (res.success) {
      setProposalServiceEditData(res?.data);
    }
  }

  async function handleEditProposalService(e) {
    e.preventDefault();

    try {
      const res = await editService(
        editProposalServiceId,
        proposalServiceEditData
      );

      if (res.success) {
        toast.success("Service Updated successfully");
        setProposalServiceEditData(initalServiceFormData);
        fetchAllServices();
        setEditProposalServiceId(null);
      } else {
        toast.error(res.message || "Failed to update service");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Error updating services");
    }
  }

  useEffect(() => {
    customerDetails();
    fetchAllServices();
  }, []);

  const handleSelectService = (service) => {
    setSelectedServices((prevSelected) => {
      const isSelected = prevSelected.some((s) => s._id === service._id);
      if (isSelected) {
        return prevSelected.filter((s) => s._id !== service._id);
      } else {
        return [...prevSelected, service];
      }
    });
  };

  // ---------------- Delete function ----------------

  async function handleDeleteService(id) {
    const confirm = window.confirm("Are you sure to delete the service");
    if (confirm) {
      const res = await deleteService(id);
      if (res.success) {
        fetchAllServices();
      }
    }
  }

  useEffect(() => {
    const serviceIds = selectedServices.map((s) => s._id);
    setFormData((prev) => ({ ...prev, services: serviceIds }));
  }, [selectedServices]);

  return (
    <div className="w-full">
      <h1 className="font-bold text-3xl text-center my-5">Create Perposal</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 px-10 mt-5">
        <div>
          <CommonForm
            formControls={addProposalFormControl}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleProposalSubmit}
            buttonText={"Create Proposal"}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-3 ">
            {!servicesItem.length ? (
              <div className="flex items-center justify-center bg-red-500 border-2 border-dashed border-gray-400 rounded-lg p-4 text-white hover:bg-red-500 transition-colors duration-200">
                Add some service
              </div>
            ) : (
              servicesItem.map((item) => (
                <div key={item?._id} className="flex flex-col">
                  <button
                    onClick={() => handleSelectService(item)}
                    className={`group block rounded-t-lg p-4 border shadow-sm transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      selectedServices.some((s) => s?._id === item?._id)
                        ? "bg-blue-100 border-blue-400"
                        : "bg-white border-gray-200 hover:shadow-md hover:border-gray-300"
                    }`}
                  >
                    <div className="text-center">
                      <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors py-2">
                        {item?.serviceTitle}
                      </p>
                      {item?.description && (
                        <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors border-t py-2">
                          {item?.description}
                        </p>
                      )}
                    </div>

                    {item?.discountPercentage ? (
                      <p>Discount Percentage : {item?.discountPercentage}%</p>
                    ) : (
                      <p>
                        Discount Amount : ₹{" "}
                        {item?.discountAmount?.toLocaleString("en-IN")}
                      </p>
                    )}

                    <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
                      <span>{item?.duration}</span>
                      <span className="font-bold text-gray-700">
                        ₹ {item?.amount?.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </button>

                  <div className="flex justify-between px-4 py-3 border rounded-b-2xl ">
                    <div
                      onClick={() => getProposalServiceIdForEdit(item?._id)}
                      className="bg-blue-300 p-2 rounded-full cursor-pointer"
                    >
                      <Edit />
                    </div>
                    <div
                      onClick={() => handleDeleteService(item?._id)}
                      className="bg-red-300 p-2 rounded-full cursor-pointer"
                    >
                      <Trash />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <CommonForm
              formControls={ServiceFormControl}
              formData={
                editProposalServiceId
                  ? proposalServiceEditData
                  : serviceFormData
              }
              setFormData={
                editProposalServiceId
                  ? setProposalServiceEditData
                  : setServiceFormData
              }
              onSubmit={
                editProposalServiceId
                  ? handleEditProposalService
                  : handleService
              }
              buttonText={
                editProposalServiceId ? "Edit Service" : "Add Service"
              }
            />
          </div>

          <div className="border flex flex-col p-6 rounded-lg shadow-md bg-gray-50">
            <h2 className="text-xl font-semibold mb-1 border-b pb-1 text-gray-700">
              Client Details
            </h2>
            <div className="space-y-1 text-gray-600">
              <p>
                <strong>Company:</strong> {company}
              </p>
              <p>
                <strong>Name:</strong> {name}
              </p>
              <p>
                <strong>Phone:</strong> {phone}
              </p>
              <p>
                <strong>TAN NO:</strong> {tanNo || "NA"}
              </p>
              <p>
                <strong>Email:</strong> {email}
              </p>
              <p>
                <strong>Address:</strong> {Address}, {city}, {country}
              </p>
              <p>
                <strong>GSTIN:</strong> {GSTIN}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Proposal;
