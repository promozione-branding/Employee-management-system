"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Edit, Trash } from "lucide-react";

import CommonForm from "@/components/layout/Form";

import {
  createInviceFormControls,
  createServiceForInvoice,
} from "@/config/data";

import { initialInvoiceServiceFormData } from "@/config/initialFormDate";

import {
  editInvoiceById,
  fetchInvoiceById,
  createInvoiceServiceService,
  getAllinvoiceServices,
} from "@/service/invoice";

import {
  deleteInvoiceServiceById,
  editInvoiceServiceById,
  fetchInvoiceServiceById,
} from "@/service/invoice/invoiceService";

const EditInvoice = ({ id }) => {
  const router = useRouter();

  // -----------------------------------------
  // STATE
  // -----------------------------------------

  const [invoiceFormData, setInvoiceFormData] = useState({
    taxType: "",
    invoiceDate: "",
    invoiceNo: "",
  });

  const [clientDetails, setClientDetails] = useState({});

  const [invoiceServiceItem, setInvoiceServiceItem] = useState([]);

  const [selectedServices, setSelectedServices] = useState([]);

  const [invoiceLoading, setInvoiceLoading] = useState(true);

  const [isUpdatingInvoice, setIsUpdatingInvoice] = useState(false);

  const [isCreatingService, setIsCreatingService] = useState(false);

  const [isUpdatingService, setIsUpdatingService] = useState(false);

  const [editInvoiceServiceId, setEditInvoiceServiceId] = useState(null);

  const [serviceFormData, setServiceFormData] = useState(
    initialInvoiceServiceFormData
  );

  const [editData, setEditData] = useState(
    initialInvoiceServiceFormData
  );

  // -----------------------------------------
  // CLIENT DETAILS
  // -----------------------------------------

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

  // -----------------------------------------
  // CALCULATE TOTAL
  // -----------------------------------------

  function calculationOfTotalAmount() {
    const totalServicePrice = selectedServices.reduce(
      (total, service) => total + Number(service?.price || 0),
      0
    );

    const taxAmount = totalServicePrice * 0.18;

    return totalServicePrice + taxAmount;
  }

  // -----------------------------------------
  // FETCH ALL SERVICES
  // -----------------------------------------

  async function allInvoiceService() {
    try {
      const response = await getAllinvoiceServices();

      if (response?.success) {
        setInvoiceServiceItem(response.data || []);

        return response.data || [];
      }

      toast.error(
        response?.message || "Failed to fetch invoice services"
      );

      return [];
    } catch (error) {
      console.error("FETCH SERVICES ERROR:", error);

      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch invoice services"
      );

      return [];
    }
  }

  // -----------------------------------------
  // LOAD INVOICE + SERVICES
  // -----------------------------------------

  async function loadInvoiceData() {
    if (!id) return;

    try {
      setInvoiceLoading(true);

      // Fetch both at the same time
      const [invoiceResponse, servicesResponse] = await Promise.all([
        fetchInvoiceById(id),
        getAllinvoiceServices(),
      ]);

      // -----------------------------------------
      // CHECK INVOICE
      // -----------------------------------------

      if (!invoiceResponse?.success) {
        toast.error(
          invoiceResponse?.message || "Failed to fetch invoice"
        );

        return;
      }

      // -----------------------------------------
      // CHECK SERVICES
      // -----------------------------------------

      if (!servicesResponse?.success) {
        toast.error(
          servicesResponse?.message ||
          "Failed to fetch invoice services"
        );

        return;
      }

      const invoice = invoiceResponse.data;

      const allServices = Array.isArray(servicesResponse.data)
        ? servicesResponse.data
        : [];

      // Store all current services
      setInvoiceServiceItem(allServices);

      // -----------------------------------------
      // INVOICE FORM DATA
      // -----------------------------------------

      setInvoiceFormData({
        taxType: invoice?.taxType || "",

        invoiceDate: invoice?.invoiceDate
          ? new Date(invoice.invoiceDate)
            .toISOString()
            .split("T")[0]
          : "",

        invoiceNo: invoice?.invoiceNo || "",
      });

      // -----------------------------------------
      // CLIENT DETAILS
      // -----------------------------------------

      setClientDetails({
        name: invoice?.clientName || "",
        company: invoice?.clientCompany || "",
        Address: invoice?.clientAddress || "",
        GSTIN: invoice?.GSTIN || "",
        tanNo: invoice?.tanNo || "",

        // These may not exist in invoice response
        phone: invoice?.phone || "",
        email: invoice?.email || "",
        city: invoice?.city || "",
        country: invoice?.country || "",
      });

      // -----------------------------------------
      // MATCH SAVED INVOICE SERVICES
      // WITH REAL InvoiceService DOCUMENTS
      // -----------------------------------------

      const savedServices = Array.isArray(invoice?.services)
        ? invoice.services
        : [];

      if (savedServices.length > 0) {
        const matchedServices = savedServices
          .map((savedService) => {
            if (!savedService) {
              return null;
            }

            const matchedService = allServices.find(
              (service) =>
                service?.serviceName === savedService?.serviceName &&
                String(service?.HSN) === String(savedService?.HSN) &&
                Number(service?.price) ===
                Number(savedService?.price)
            );

            return matchedService || null;
          })
          .filter(Boolean);

        setSelectedServices(matchedServices);

        // If some old service no longer exists
        if (matchedServices.length !== savedServices.length) {
          toast.error(
            "Some services from this invoice are no longer available."
          );
        }
      } else {
        setSelectedServices([]);
      }
    } catch (error) {
      console.error("LOAD INVOICE ERROR:", error);

      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load invoice"
      );
    } finally {
      setInvoiceLoading(false);
    }
  }

  // -----------------------------------------
  // SELECT / UNSELECT SERVICE
  // -----------------------------------------

  const handleSelectService = (service) => {
    if (!service?._id) {
      toast.error("Invalid service.");
      return;
    }

    setSelectedServices((prevSelected) => {
      const isSelected = prevSelected.some(
        (selected) =>
          String(selected?._id) === String(service?._id)
      );

      if (isSelected) {
        return prevSelected.filter(
          (selected) =>
            String(selected?._id) !== String(service?._id)
        );
      }

      return [...prevSelected, service];
    });
  };

  // -----------------------------------------
  // UPDATE INVOICE
  // -----------------------------------------

  async function handleInvoiceFormSubmit(e) {
    e.preventDefault();

    // -----------------------------------------
    // VALIDATION
    // -----------------------------------------

    if (!invoiceFormData.invoiceNo) {
      toast.error("Invoice number is required.");
      return;
    }

    if (String(invoiceFormData.invoiceNo).length > 13) {
      toast.error("Invoice number cannot be more than 13 characters.");
      return;
    }

    if (selectedServices.length === 0) {
      toast.error("Please select at least one service.");
      return;
    }

    if (
      !invoiceFormData.invoiceDate ||
      !invoiceFormData.taxType
    ) {
      toast.error(
        "Please fill in Invoice Date and Tax Type."
      );

      return;
    }

    if (!invoiceFormData.invoiceNo) {
      toast.error("Invoice number is required.");
      return;
    }

    // -----------------------------------------
    // GET REAL InvoiceService IDs
    // -----------------------------------------

    const serviceIds = [
      ...new Set(
        selectedServices
          .map((service) => service?._id)
          .filter(Boolean)
          .map((serviceId) => String(serviceId))
      ),
    ];

    if (serviceIds.length === 0) {
      toast.error("Please select at least one valid service.");
      return;
    }

    setIsUpdatingInvoice(true);

    try {
      const invoiceData = {
        taxType: invoiceFormData.taxType,

        invoiceDate: invoiceFormData.invoiceDate,

        invoiceNo: invoiceFormData.invoiceNo,

        // Keep your existing frontend payload
        clientId: id,

        clientName: name,

        clientCompany: company,

        clientAddress: `${Address || ""}${city ? ` - ${city}` : ""
          }${country ? ` - ${country}` : ""}`,

        GSTIN,

        tanNo,

        // IMPORTANT:
        // These are REAL InvoiceService IDs now
        services: serviceIds,

        totalAmount: calculationOfTotalAmount(),
      };

      console.log(
        "UPDATE INVOICE PAYLOAD:",
        invoiceData
      );

      const response = await editInvoiceById(
        id,
        invoiceData
      );

      if (response?.success) {
        toast.success(
          "Invoice updated successfully!"
        );

      } else {
        toast.error(
          response?.message ||
          "Failed to update invoice"
        );
      }
    } catch (error) {
      console.error(
        "UPDATE INVOICE ERROR:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update invoice"
      );
    } finally {
      setIsUpdatingInvoice(false);
    }
  }

  // -----------------------------------------
  // CREATE SERVICE
  // -----------------------------------------

  async function handleServiceFormSubmit(e) {
    e.preventDefault();

    setIsCreatingService(true);

    try {
      const response =
        await createInvoiceServiceService(
          serviceFormData
        );

      if (response?.success) {
        toast.success(
          "Service added successfully!"
        );

        setServiceFormData(
          initialInvoiceServiceFormData
        );

        await allInvoiceService();
      } else {
        toast.error(
          response?.message ||
          "Failed to create service"
        );
      }
    } catch (error) {
      console.error(
        "CREATE SERVICE ERROR:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create service"
      );
    } finally {
      setIsCreatingService(false);
    }
  }

  // -----------------------------------------
  // EDIT SERVICE
  // -----------------------------------------

  async function handleEditInvoiceService(serviceId) {
    if (!serviceId) {
      toast.error("Invalid service.");
      return;
    }

    try {
      setEditInvoiceServiceId(serviceId);

      const response =
        await fetchInvoiceServiceById(serviceId);

      if (response?.success) {
        const {
          HSN,
          price,
          serviceName,
        } = response.data;

        setEditData({
          HSN: HSN || "",
          price: price ?? "",
          serviceName: serviceName || "",
        });
      } else {
        toast.error(
          response?.message ||
          "Failed to fetch service details."
        );

        setEditInvoiceServiceId(null);
      }
    } catch (error) {
      console.error(
        "FETCH SERVICE DETAILS ERROR:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch service details."
      );

      setEditInvoiceServiceId(null);
    }
  }

  // -----------------------------------------
  // UPDATE SERVICE
  // -----------------------------------------

  async function handleSubmitInvoiceService(e) {
    e.preventDefault();

    if (!editInvoiceServiceId) {
      return;
    }

    setIsUpdatingService(true);

    try {
      const response =
        await editInvoiceServiceById(
          editInvoiceServiceId,
          editData
        );

      if (response?.success) {
        toast.success(
          "Service updated successfully!"
        );

        // -----------------------------------------
        // IMPORTANT
        // Reload ALL services after update
        // -----------------------------------------

        const updatedServices =
          await allInvoiceService();

        // -----------------------------------------
        // Update selected service
        // -----------------------------------------

        setSelectedServices((prevSelected) =>
          prevSelected.map((service) => {
            if (
              String(service?._id) !==
              String(editInvoiceServiceId)
            ) {
              return service;
            }

            const updatedService =
              updatedServices.find(
                (item) =>
                  String(item?._id) ===
                  String(editInvoiceServiceId)
              );

            return (
              updatedService || {
                ...service,
                ...editData,
              }
            );
          })
        );

        setEditInvoiceServiceId(null);

        setEditData(
          initialInvoiceServiceFormData
        );
      } else {
        toast.error(
          response?.message ||
          "Failed to update service"
        );
      }
    } catch (error) {
      console.error(
        "UPDATE SERVICE ERROR:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Error updating service"
      );
    } finally {
      setIsUpdatingService(false);
    }
  }

  // -----------------------------------------
  // DELETE SERVICE
  // -----------------------------------------

  async function handleDeleteInvoiceById(serviceId) {
    if (!serviceId) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response =
        await deleteInvoiceServiceById(serviceId);

      if (response?.success) {
        toast.success("Service deleted.");

        // -----------------------------------------
        // Remove from service list
        // -----------------------------------------

        const updatedServices =
          await allInvoiceService();

        // -----------------------------------------
        // Remove from selected services
        // -----------------------------------------

        setSelectedServices((prevSelected) =>
          prevSelected.filter(
            (service) =>
              String(service?._id) !==
              String(serviceId)
          )
        );

        // -----------------------------------------
        // Close edit form if same service
        // -----------------------------------------

        if (
          String(editInvoiceServiceId) ===
          String(serviceId)
        ) {
          setEditInvoiceServiceId(null);

          setEditData(
            initialInvoiceServiceFormData
          );
        }
      } else {
        toast.error(
          response?.message ||
          "Failed to delete service"
        );
      }
    } catch (error) {
      console.error(
        "DELETE SERVICE ERROR:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete service"
      );
    }
  }

  // -----------------------------------------
  // INITIAL LOAD
  // -----------------------------------------

  useEffect(() => {
    if (!id) return;

    loadInvoiceData();
  }, [id]);

  // -----------------------------------------
  // LOADING
  // -----------------------------------------

  if (invoiceLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <p className="text-lg font-medium">
          Loading invoice...
        </p>
      </div>
    );
  }

  // -----------------------------------------
  // UI
  // -----------------------------------------

  return (
    <div>
      <p className="font-bold text-2xl text-center mb-6">
        Edit Invoice
      </p>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        {/* ================================= */}
        {/* LEFT SIDE */}
        {/* ================================= */}

        <div>

          {/* INVOICE FORM */}

          <CommonForm
            formControls={createInviceFormControls}
            formData={invoiceFormData}
            setFormData={setInvoiceFormData}
            onSubmit={handleInvoiceFormSubmit}
            buttonText="Update Invoice"
            isBtnDisabled={isUpdatingInvoice}
          />

          {/* SELECT SERVICES */}

          <div className="border-t-2 mt-6 py-4">

            <div className="flex justify-between items-center mb-4">

              <h2 className="font-semibold text-xl">
                Select Services
              </h2>

              <p className="font-semibold">
                Total: ₹
                {calculationOfTotalAmount().toLocaleString(
                  "en-IN"
                )}
              </p>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {invoiceServiceItem.map((item) => {

                const isSelected =
                  selectedServices.some(
                    (service) =>
                      String(service?._id) ===
                      String(item?._id)
                  );

                return (
                  <div
                    key={item?._id}
                    className="flex flex-col"
                  >

                    {/* SELECT SERVICE */}

                    <button
                      type="button"
                      onClick={() =>
                        handleSelectService(item)
                      }
                      className={`group block rounded-t-lg p-4 border shadow-sm transition-all duration-300 ${isSelected
                        ? "bg-blue-100 border-blue-400"
                        : "bg-white border-gray-200 hover:shadow-md hover:border-gray-300"
                        }`}
                    >

                      <div className="text-center">

                        <p className="font-semibold text-gray-800 capitalize mt-5">
                          {item?.serviceName}
                        </p>

                      </div>

                      <div className="text-center">
                        HSN CODE: {item?.HSN}
                      </div>

                      <div className="mt-2 text-lg font-bold text-black text-center">
                        Price: ₹
                        {Number(
                          item?.price || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </div>

                      {isSelected && (
                        <p className="text-blue-600 text-sm font-semibold mt-2">
                          Selected
                        </p>
                      )}

                    </button>

                    {/* EDIT / DELETE */}

                    <div className="flex justify-between px-4 py-3 border rounded-b-2xl">

                      <button
                        type="button"
                        onClick={() =>
                          handleEditInvoiceService(
                            item?._id
                          )
                        }
                        className="bg-blue-300 p-2 rounded-full cursor-pointer"
                      >
                        <Edit size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteInvoiceById(
                            item?._id
                          )
                        }
                        className="bg-red-300 p-2 rounded-full cursor-pointer"
                      >
                        <Trash size={18} />
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>

            {invoiceServiceItem.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No services available.
              </p>
            )}

          </div>

        </div>

        {/* ================================= */}
        {/* RIGHT SIDE */}
        {/* ================================= */}

        <div className="flex flex-col mt-10 gap-5">

          {/* CLIENT DETAILS */}

          <div className="border p-6 rounded-lg shadow-md bg-gray-50">

            <h2 className="text-xl font-semibold mb-1 border-b pb-1 text-gray-700">
              Client Details
            </h2>

            <div className="space-y-1 text-gray-600">

              <p>
                <strong>Company:</strong>{" "}
                {company || "NA"}
              </p>

              <p>
                <strong>Name:</strong>{" "}
                {name || "NA"}
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                {phone || "NA"}
              </p>

              <p>
                <strong>TAN NO:</strong>{" "}
                {tanNo || "NA"}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {email || "NA"}
              </p>

              <p>
                <strong>Address:</strong>{" "}
                {Address || "NA"}
                {city ? `, ${city}` : ""}
                {country ? `, ${country}` : ""}
              </p>

              <p>
                <strong>GSTIN:</strong>{" "}
                {GSTIN || "NA"}
              </p>

            </div>

          </div>

          {/* CREATE / EDIT SERVICE */}

          <CommonForm
            formControls={createServiceForInvoice}

            formData={
              editInvoiceServiceId
                ? editData
                : serviceFormData
            }

            setFormData={
              editInvoiceServiceId
                ? setEditData
                : setServiceFormData
            }

            onSubmit={
              editInvoiceServiceId
                ? handleSubmitInvoiceService
                : handleServiceFormSubmit
            }

            buttonText={
              editInvoiceServiceId
                ? "Update Service"
                : "Add Service"
            }

            isBtnDisabled={
              editInvoiceServiceId
                ? isUpdatingService
                : isCreatingService
            }
          />

        </div>

      </div>
    </div>
  );
};

export default EditInvoice;