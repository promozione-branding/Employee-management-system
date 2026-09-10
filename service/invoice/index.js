import toast from "react-hot-toast";
import axiosInstance from "../axiosInstance";

export async function createInvoiceServiceService(formData) {
  const { data } = await axiosInstance.post(
    "/api/invoice/service/create",
    formData
  );
  return data;
}

export async function getAllinvoiceServices() {
  try {
    const { data } = await axiosInstance.get(
      "/api/invoice/service/all-invoice-service"
    );
    if (data.success) {
      toast.success(data.message);

      return data;
    }
  } catch (error) {
    console.log(error);
    toast.error(error.message || "error while fetch all invoices services");
  }
}

// that is for main invoice creation
export async function createInvoiceService(invoiceFormData) {
  try {
    const { data } = await axiosInstance.post(
      "/api/invoice/create",
      invoiceFormData
    );

    return data;
  } catch (error) {
    console.log("CREATE INVOICE ERROR:", error);

    return {
      success: false,
      status: error.response?.status,
      message:
        error.response?.data?.message ||
        error.message ||
        "Error while creating the invoice",
    };
  }
}

export async function editInvoiceById(id, invoiceData) {
  try {
    const { data } = await axiosInstance.put(
      `/api/invoice/${id}`,
      invoiceData
    );

    return data;
  } catch (error) {
    console.log("UPDATE INVOICE ERROR:", error);

    return {
      success: false,
      status: error.response?.status,
      message:
        error.response?.data?.message ||
        error.message ||
        "Error while updating invoice",
    };
  }
}


export async function getNextInvoiceNumber() {
  try {
    const response = await fetch("/api/invoice/next-number");

    const data = await response.json();

    return data;
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function getInvoiceAllInvoice() {
  try {
    const { data } = await axiosInstance.get("/api/invoice/get-all-invoice");

    if (data.success) {
      toast.success(data.message || "All invoices");
      return data;
    }
  } catch (error) {
    console.log(error);
    toast.error(error.message || "error while getting all Invoices");
  }
}

export async function getInvoiceById(id) {
  try {
    const { data } = await axiosInstance.get(`/api/invoice/view-invoice/${id}`);
    if (data.success) {
      toast.success(data?.message || "cant fetched invoice");
      return data;
    }
  } catch (error) {
    console.log(error);
    toast.error(error.message || "error while getting particular invoice");
  }
}

export async function pdfDownloaderById(id) {
  try {
    const { data } = await axiosInstance.get(`/api/invoice/pdf-download/${id}`);
    return data;
  } catch (error) {
    console.log(error);
    toast.error(error.message || "error while fetch pdf information");
  }
}

export async function sendInvoicePdfService(id) {
  const { data } = await axiosInstance.post("/api/invoice/send-email", id);
  return data;
}

// GET SINGLE INVOICE
export async function fetchInvoiceById(id) {
  try {
    const { data } = await axiosInstance.get(
      `/api/invoice/${id}`
    );

    return data;
  } catch (error) {
    console.log("FETCH INVOICE ERROR:", error);

    return {
      success: false,
      status: error.response?.status,
      message:
        error.response?.data?.message ||
        error.message ||
        "Error while fetching invoice",
    };
  }
}


export async function deleteInvoiceById(id) {
  try {
    const { data } = await axiosInstance.delete(
      `/api/invoice/${id}`
    );

    return data;
  } catch (error) {
    console.error("DELETE INVOICE SERVICE ERROR:", error);

    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete invoice.",
    };
  }
}