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
  const [invoiceFormData, setInvoiceFormData] = useState({
    taxType: "",
    invoiceDate: "",
  });

  const [editInvoiceServiceId, setEditInvoiceServiceId] = useState(null);

  const [clientDetails, setClientDetails] = useState({});
  const [serviceFormData, setServiceFormData] = useState(initialInvoiceServiceFormData);
  const [editData, setEditData] = useState(initialInvoiceServiceFormData);

  const [invoiceServiceItem, setInvoiceServiceItem] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  // 🆕 Loading states
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false); 
  const [isCreatingService, setIsCreatingService] = useState(false);
  const [isUpdatingService, setIsUpdatingService] = useState(false);

  const { Address, GSTIN, city, company, country, name, phone, tanNo, email } =
    clientDetails;

  // ---------------- CALCULATION ----------------
  function calculationOfTotalAmount() {
    const totalServicePrice = selectedServices.reduce(
      (total, service) => total + Number(service.price || 0),
      0
    );

    let tdsAmount = 0;

    if (tanNo?.length !== 0) {
      tdsAmount = totalServicePrice * 0.02;
    }

    const taxAmount = totalServicePrice * 0.18;

    const totalAmount = tanNo?.length
      ? taxAmount + totalServicePrice - tdsAmount
      : taxAmount + totalServicePrice;

    return totalAmount;
  }

  const invoiceFormDate = {
    clientId: id,
    clientName: name,
    clientCompany: company,
    clientAddress: `${Address} -${city} -${country}`,
    GSTIN,
    tanNo,
    services: selectedServices.map(({ _id }) => _id),
    taxType: invoiceFormData.taxType,
    invoiceDate: invoiceFormData.invoiceDate,
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
    const { data } = await getAllinvoiceServices();
    setInvoiceServiceItem(data);
  }

  async function customerDetails() {
    try {
      const response = await getCustomerServices(id);
      if (response.success) {
        setClientDetails(response.data);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  // ---------------- CREATE INVOICE ----------------
  async function handleInvoiceFormSubmit(e) {
    e.preventDefault();

    if (selectedServices.length === 0) {
      toast.error("Please select at least one service.");
      return;
    }

    if (!invoiceFormData.invoiceDate || !invoiceFormData.taxType) {
      toast.error("Please fill in Invoice Date and Tax Type.");
      return;
    }

    setIsCreatingInvoice(true); // 🆕 Start loading

    const res = await createInvoiceService(invoiceFormDate);

    setIsCreatingInvoice(false); // 🆕 End loading

    if (res.success) {
      toast.success("Invoice created successfully!");
      setSelectedServices([]);
      setInvoiceFormData({ taxType: "", invoiceDate: "" });
      router.push(`/customer/${id}`);
    }
  }

  // ---------------- CREATE SERVICE ----------------
  async function handleServiceFormSubmit(e) {
    e.preventDefault();
    setIsCreatingService(true); // 🆕

    try {
      const res = await createInvoiceServiceService(serviceFormData);
      setIsCreatingService(false); // 🆕

      if (res.success) {
        toast.success("Service added successfully!");
        setServiceFormData(initialInvoiceServiceFormData);
        allInvoiceService();
      } else {
        toast.error(res.message || "Failed to create service");
      }
    } catch (error) {
      setIsCreatingService(false); // 🆕
      toast.error(error.message || "Unexpected error");
    }
  }

  // ---------------- EDIT SERVICE ----------------

  // fetching particular invoice here 
  async function handleEditInvoiceService(serviceId) {
    setEditInvoiceServiceId(serviceId);

    const res = await fetchInvoiceServiceById(serviceId);
    if (res.success) {
      const { HSN, price, serviceName } = res.data;
      setEditData({ HSN, price, serviceName });
    } else {
      toast.error("Failed to fetch service details.");
    }
  }

  async function handleSubmitInvoiceService(e) {
    e.preventDefault();
    setIsUpdatingService(true); // 🆕

    try {
      const res = await editInvoiceServiceById(editInvoiceServiceId, editData);
      setIsUpdatingService(false); // 🆕

      if (res.success) {
        toast.success("Service updated successfully!");
        allInvoiceService();
        setEditInvoiceServiceId(null);
        setEditData(initialInvoiceServiceFormData);
      } else {
        toast.error(res.message || "Failed to update service");
      }
    } catch (error) {
      setIsUpdatingService(false); // 🆕
      toast.error(error.message || "Error updating service");
    }
  }

  // ---------------- DELETE SERVICE ----------------
  async function handleDeleteInvoiceById(id) {
    const confirmed = window.confirm("Are you sure you want to delete this service?");
    if (confirmed) {
      const res = await deleteInvoiceServiceById(id);
      if (res.success) {
        toast.success("Service deleted.");
        allInvoiceService();
      }
    }
  }

  // ---------------- USE EFFECT ----------------
  useEffect(() => {
    customerDetails();
    allInvoiceService();
  }, []);

  return (
    <div>
      <p className="font-bold text-2xl text-center">Create Invoice</p>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 ">
        <div>
          {/* INVOICE FORM */}
          <CommonForm
            formControls={createInviceFormControls}
            formData={invoiceFormData}
            setFormData={setInvoiceFormData}
            onSubmit={handleInvoiceFormSubmit}
            buttonText="Create Invoice"
            isBtnDisabled={isCreatingInvoice} // 🆕
          />

          {/* SERVICE SELECTION GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t-2 mt-6 py-4">
            {invoiceServiceItem.map((item) => (
              <div key={item?._id} className="flex flex-col">
                <button
                  onClick={() => handleSelectService(item)}
                  className={`group block rounded-t-lg p-4 border shadow-sm transition-all duration-300 ease-in-out 
                    ${
                      selectedServices.some((s) => s?._id === item?._id)
                        ? "bg-blue-100 border-blue-400"
                        : "bg-white border-gray-200 hover:shadow-md hover:border-gray-300"
                    }`}
                >
                  <div className="text-center">
                    <p className="font-semibold text-gray-800 capitalize mt-5">
                      {item?.serviceName}
                    </p>
                  </div>
                  <div className="text-center">HSN CODE: {item?.HSN}</div>
                  <div className="mt-2 text-lg font-bold text-black text-center">
                    Price: ₹{item?.price?.toLocaleString("en-IN")}
                  </div>
                </button>

                <div className="flex justify-between px-4 py-3 border rounded-b-2xl ">
                  <div
                    onClick={() => handleEditInvoiceService(item?._id)}
                    className="bg-blue-300 p-2 rounded-full cursor-pointer"
                  >
                    <Edit />
                  </div>
                  <div
                    onClick={() => handleDeleteInvoiceById(item?._id)}
                    className="bg-red-300 p-2 rounded-full cursor-pointer"
                  >
                    <Trash />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col mt-10 gap-5">
          {/* CLIENT DETAILS */}
          <div className="border p-6 rounded-lg shadow-md bg-gray-50">
            <h2 className="text-xl font-semibold mb-1 border-b pb-1 text-gray-700">
              Client Details
            </h2>
            <div className="space-y-1 text-gray-600">
              <p><strong>Company:</strong> {company}</p>
              <p><strong>Name:</strong> {name}</p>
              <p><strong>Phone:</strong> {phone}</p>
              <p><strong>TAN NO:</strong> {tanNo || "NA"}</p>
              <p><strong>Email:</strong> {email}</p>
              <p><strong>Address:</strong> {Address}, {city}, {country}</p>
              <p><strong>GSTIN:</strong> {GSTIN}</p>
            </div>
          </div>

          {/* CREATE/EDIT SERVICE FORM */}
          <CommonForm
            formControls={createServiceForInvoice}
            formData={editInvoiceServiceId ? editData : serviceFormData}
            setFormData={editInvoiceServiceId ? setEditData : setServiceFormData}
            onSubmit={
              editInvoiceServiceId
                ? handleSubmitInvoiceService
                : handleServiceFormSubmit
            }
            buttonText={editInvoiceServiceId ? "Update Service" : "Add Service"}
            isBtnDisabled={
              editInvoiceServiceId ? isUpdatingService : isCreatingService
            } // 🆕
          />
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;
