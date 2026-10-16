// app/dashboard/invoice/[create]/CreateInvoice.jsx


"use client";

import CommonForm from "@/components/layout/Form";
import {
  createInviceFormControls,
  createServiceForInvoice,
} from "@/config/data";
import { initialInvoiceServiceFormData } from "@/config/initialFormDate";
import { getCustomerServices } from "@/service/customer";
import {
  createInvoiceService,
  createInvoiceServiceService,
  getAllinvoiceServices,
  getNextInvoiceNumber,
} from "@/service/invoice";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Edit, Trash } from "lucide-react";
import {
  deleteInvoiceServiceById,
  editInvoiceServiceById,
  fetchInvoiceServiceById,
} from "@/service/invoice/invoiceService";

const CreateInvoice = ({ id }) => {
  const router = useRouter();

  // ---------------- STATE ----------------
  const [editInvoiceServiceId, setEditInvoiceServiceId] = useState(null);
  const [clientDetails, setClientDetails] = useState({});
  const [serviceFormData, setServiceFormData] = useState(
    initialInvoiceServiceFormData
  );
  const [editData, setEditData] = useState(initialInvoiceServiceFormData);
  const [invoiceServiceItem, setInvoiceServiceItem] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  // Loading states
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [isCreatingService, setIsCreatingService] = useState(false);
  const [isUpdatingService, setIsUpdatingService] = useState(false);

  const {
    Address,
    GSTIN,
    city,
    company,
    country,
    name,
    phone,
    tanNo,
    email,
  } = clientDetails;

  // Invoice Type added; defaults to the existing Tax Invoice.
  const [invoiceFormData, setInvoiceFormData] = useState({
    invoiceType: "normal",
    taxType: "",
    invoiceDate: "",
    invoiceNo: "",
  });

  // Automatically select GST tax type based on GSTIN state code.
  useEffect(() => {
    if (!GSTIN) return;

    const stateCode = String(GSTIN).substring(0, 2);

    setInvoiceFormData((prev) => ({
      ...prev,
      taxType: stateCode === "07" ? "SGST/CGST" : "IGST",
    }));
  }, [GSTIN]);

  // ---------------- CALCULATION ----------------
  function calculationOfTotalAmount() {
    const taxableAmount = selectedServices.reduce(
      (total, service) => total + Number(service?.price || 0),
      0
    );

    if (invoiceFormData.taxType === "IGST") {
      return taxableAmount + taxableAmount * 0.18;
    }

    if (invoiceFormData.taxType === "SGST/CGST") {
      return taxableAmount + taxableAmount * 0.09 + taxableAmount * 0.09;
    }

    return taxableAmount;
  }

  // ---------------- INVOICE PAYLOAD ----------------
  const invoiceFormDate = {
    clientId: id,
    clientName: name,
    clientCompany: company,
    clientAddress: `${Address} -${city} -${country}`,
    GSTIN,
    tanNo,
    services: selectedServices.map(({ _id }) => _id),
    invoiceType: invoiceFormData.invoiceType || "normal",
    taxType: invoiceFormData.taxType,
    invoiceDate: invoiceFormData.invoiceDate,
    invoiceNo: invoiceFormData.invoiceNo,
    totalAmount: calculationOfTotalAmount(),
  };

  // ---------------- SELECT SERVICE ----------------
  const handleSelectService = (service) => {
    setSelectedServices((prevSelected) => {
      const isSelected = prevSelected.some((s) => s._id === service._id);

      return isSelected
        ? prevSelected.filter((s) => s._id !== service._id)
        : [...prevSelected, service];
    });
  };

  // ---------------- API CALLS ----------------
  async function allInvoiceService() {
    try {
      const { data } = await getAllinvoiceServices();
      setInvoiceServiceItem(data || []);
    } catch (error) {
      toast.error(error.message || "Failed to fetch services");
    }
  }

  async function customerDetails() {
    try {
      const response = await getCustomerServices(id);

      if (response.success) {
        setClientDetails(response.data);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch customer details");
    }
  }

  // ---------------- CREATE INVOICE ----------------
  async function handleInvoiceFormSubmit(e) {
    e.preventDefault();

    if (!selectedServices.length) {
      toast.error("Please select at least one service.");
      return;
    }

    if (
      !invoiceFormData.invoiceDate ||
      !invoiceFormData.taxType ||
      !invoiceFormData.invoiceType
    ) {
      toast.error("Please fill in Invoice Type, Invoice Date and Tax Type.");
      return;
    }

    if (!invoiceFormData.invoiceNo) {
      toast.error("Please enter an invoice number.");
      return;
    }

    if (String(invoiceFormData.invoiceNo).length > 13) {
      toast.error("Invoice number cannot be more than 13 characters.");
      return;
    }

    setIsCreatingInvoice(true);

    try {
      const res = await createInvoiceService(invoiceFormDate);

      if (res.success) {
        toast.success("Invoice created successfully!");

        setSelectedServices([]);

        setInvoiceFormData({
          invoiceType: "normal",
          taxType: "",
          invoiceDate: "",
          invoiceNo: "",
        });

        router.push(`/dashboard/customer/${id}`);
      } else {
        toast.error(res.message || "Failed to create invoice");
      }
    } catch (error) {
      toast.error(error.message || "Failed to create invoice");
    } finally {
      setIsCreatingInvoice(false);
    }
  }

  // ---------------- CREATE SERVICE ----------------
  async function handleServiceFormSubmit(e) {
    e.preventDefault();
    setIsCreatingService(true);

    try {
      const res = await createInvoiceServiceService(serviceFormData);

      if (res.success) {
        toast.success("Service added successfully!");
        setServiceFormData(initialInvoiceServiceFormData);
        await allInvoiceService();
      } else {
        toast.error(res.message || "Failed to create service");
      }
    } catch (error) {
      toast.error(error.message || "Unexpected error");
    } finally {
      setIsCreatingService(false);
    }
  }

  // ---------------- EDIT SERVICE ----------------
  async function handleEditInvoiceService(serviceId) {
    setEditInvoiceServiceId(serviceId);

    try {
      const res = await fetchInvoiceServiceById(serviceId);

      if (res.success) {
        const { HSN, price, serviceName } = res.data;
        setEditData({ HSN, price, serviceName });
      } else {
        toast.error("Failed to fetch service details.");
        setEditInvoiceServiceId(null);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch service details.");
      setEditInvoiceServiceId(null);
    }
  }

  async function handleSubmitInvoiceService(e) {
    e.preventDefault();
    setIsUpdatingService(true);

    try {
      const res = await editInvoiceServiceById(
        editInvoiceServiceId,
        editData
      );

      if (res.success) {
        toast.success("Service updated successfully!");
        await allInvoiceService();
        setEditInvoiceServiceId(null);
        setEditData(initialInvoiceServiceFormData);
      } else {
        toast.error(res.message || "Failed to update service");
      }
    } catch (error) {
      toast.error(error.message || "Error updating service");
    } finally {
      setIsUpdatingService(false);
    }
  }

  // ---------------- DELETE SERVICE ----------------
  async function handleDeleteInvoiceById(serviceId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmed) return;

    try {
      const res = await deleteInvoiceServiceById(serviceId);

      if (res.success) {
        toast.success("Service deleted.");
        await allInvoiceService();
        setSelectedServices((prev) =>
          prev.filter((service) => service._id !== serviceId)
        );
      } else {
        toast.error(res.message || "Failed to delete service");
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete service");
    }
  }

  // ---------------- INVOICE NUMBER ----------------
  async function getInvoiceNumber() {
    try {
      const res = await getNextInvoiceNumber();

      if (res.success) {
        setInvoiceFormData((prev) => ({
          ...prev,
          invoiceNo: res.invoiceNo,
        }));
      }
    } catch (error) {
      toast.error("Failed to get invoice number");
    }
  }

  // ---------------- USE EFFECT ----------------
  useEffect(() => {
    customerDetails();
    allInvoiceService();
    getInvoiceNumber();
  }, []);

  return (
    <div>
      <p className="text-center text-2xl font-bold">Create Invoice</p>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          {/* INVOICE FORM */}
          <CommonForm
            formControls={createInviceFormControls}
            formData={invoiceFormData}
            setFormData={setInvoiceFormData}
            onSubmit={handleInvoiceFormSubmit}
            buttonText="Create Invoice"
            isBtnDisabled={isCreatingInvoice}
          />

          {/* SERVICE SELECTION GRID */}
          <div className="mt-6 grid grid-cols-1 gap-4 border-t-2 py-4 md:grid-cols-2 lg:grid-cols-3">
            {invoiceServiceItem.map((item) => (
              <div key={item?._id} className="flex flex-col">
                <button
                  type="button"
                  onClick={() => handleSelectService(item)}
                  className={`group block rounded-t-lg border p-4 shadow-sm transition-all duration-300 ease-in-out ${
                    selectedServices.some((s) => s?._id === item?._id)
                      ? "border-blue-400 bg-blue-100"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                  }`}
                >
                  <div className="text-center">
                    <p className="mt-5 font-semibold capitalize text-gray-800">
                      {item?.serviceName}
                    </p>
                  </div>

                  <div className="text-center">
                    HSN CODE: {item?.HSN}
                  </div>

                  <div className="mt-2 text-center text-lg font-bold text-black">
                    Price: ₹{item?.price?.toLocaleString("en-IN")}
                  </div>
                </button>

                <div className="flex justify-between rounded-b-2xl border px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleEditInvoiceService(item?._id)}
                    className="cursor-pointer rounded-full bg-blue-300 p-2"
                    aria-label={`Edit ${item?.serviceName}`}
                  >
                    <Edit />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteInvoiceById(item?._id)}
                    className="cursor-pointer rounded-full bg-red-300 p-2"
                    aria-label={`Delete ${item?.serviceName}`}
                  >
                    <Trash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="mt-10 flex flex-col gap-5">
          {/* CLIENT DETAILS */}
          <div className="rounded-lg border bg-gray-50 p-6 shadow-md">
            <h2 className="mb-1 border-b pb-1 text-xl font-semibold text-gray-700">
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

          {/* CREATE/EDIT SERVICE FORM */}
          <CommonForm
            formControls={createServiceForInvoice}
            formData={editInvoiceServiceId ? editData : serviceFormData}
            setFormData={
              editInvoiceServiceId ? setEditData : setServiceFormData
            }
            onSubmit={
              editInvoiceServiceId
                ? handleSubmitInvoiceService
                : handleServiceFormSubmit
            }
            buttonText={
              editInvoiceServiceId ? "Update Service" : "Add Service"
            }
            isBtnDisabled={
              editInvoiceServiceId ? isUpdatingService : isCreatingService
            }
          />
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;
