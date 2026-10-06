// service/invoice/invoiceService/index.js

const { default: axiosInstance } = require("@/service/axiosInstance");
const { default: toast } = require("react-hot-toast");

export async function fetchInvoiceServiceById(id) {
  try {
    const { data } = await axiosInstance.get(`/api/invoice/service/${id}`);

    if (data.success) {
      toast.success(data.message || "Invoice services fetched");
      return data;
    }
  } catch (error) {
    console.log(error);
    toast.error(error.message || "error while fetch invoice service");
  }
}

export async function editInvoiceServiceById(id, formData) {
  try {
    const { data } = await axiosInstance.put(
      `/api/invoice/service/${id}`,
      formData
    );

    if (data?.success) {
      toast.success(data.message || "Invoice Service Edit Successfully");
      return data;
    }
  } catch (error) {
    console.log(error);
    toast.error(error.message || "Error while editing invoice services");
  }
}

export async function deleteInvoiceServiceById(id) {
  try {
    const { data } = await axiosInstance.delete(
      `/api/invoice/service/${id}`);

    if (data?.success) {
      toast.success(data.message || "Invoice Service delete Successfully");
      return data;
    }
  } catch (error) {
    console.log(error);
    toast.error(error.message || "Error while delete invoice services");
  }
}
