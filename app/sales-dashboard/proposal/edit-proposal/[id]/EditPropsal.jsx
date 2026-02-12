"use client";

import Loading from "@/components/layout/Loading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getProposalDetail } from "@/service/customer/proposal";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createServicesService,
  deleteService,
  editService,
  fetchProposalServiceById,
  getAllService,
} from "@/service/service";
import { Edit, Trash } from "lucide-react";
import CommonForm from "@/components/layout/Form";
import { ServiceFormControl } from "@/config/data";
import { initalServiceFormData } from "@/config/initialFormDate";
import { Button } from "@/components/ui/button";
import { editProposalService } from "@/service/proposal";
import { useRouter } from "next/navigation";

const EditPropsal = ({ id }) => {
  const [proposalFormData, setProposalFormData] = useState({
    clientName: "",
    clientCompany: "",
    clientAddress: "",
    dateOfProposal: "",
    GSTIN: "",
    tanNo: "",
    validTill: "",
    paymentMethod: "",
  });

  const [loadingProposalDetails, setLoadingProposalDetails] = useState(true);
  const [proposalDetail, setProposalDetail] = useState({});

  const [servicesItem, setServicesItem] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  const [editProposalServiceId, setEditProposalServiceId] = useState(null);
  const [proposalServiceEditData, setProposalServiceEditData] = useState(
    initalServiceFormData,
  );
  const [serviceFormData, setServiceFormData] = useState(initalServiceFormData);
  const router = useRouter()

  // this is the main form
  async function handleEditForm(e) {
    e.preventDefault();

    const filledItems = {};

    for (const key in proposalFormData) {
      if (Object.hasOwn(proposalFormData, key) && proposalFormData[key]) {
        filledItems[key] = proposalFormData[key];
      }
    }

    if (selectedServices.length > 0) {
      filledItems.services = selectedServices.map((item) => item._id);
    }

    try {
      const res = await editProposalService(id, filledItems);
      if (res.success) {
        toast.success(res.message || "Proposal Edit successfully");
        router.push("/dashboard/customer")
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message || "");
    }
  }

  async function fetchProposalDetails() {
    try {
      const res = await getProposalDetail(id);
      if (res.success) {
        setProposalDetail(res.data);
        setLoadingProposalDetails(false);
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response.data.message ||
          "Error while fetching the proposal details",
      );
    }
  }

  const handleProposalFormChange = (e) => {
    const { name, value } = e.target;
    setProposalFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentMethodChange = (value) => {
    setProposalFormData((prev) => ({
      ...prev,
      paymentMethod: value,
    }));
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

  async function handleService(e) {
    e.preventDefault();
    try {
      if (
        !serviceFormData.serviceTitle ||
        !serviceFormData.amount ||
        !serviceFormData.duration
      ) {
        toast.error("please fill the service details");
        return;
      }

      if (serviceFormData?.discountPercentage > 40) {
        toast.error("Discount can't be more than 40%");
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

  async function handleDeleteService(id) {
    const confirm = window.confirm("Are you sure to delete the service");
    if (confirm) {
      const res = await deleteService(id);
      if (res.success) {
        fetchAllServices();
      }
    }
  }

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
        proposalServiceEditData,
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
    fetchProposalDetails();
    fetchAllServices();
  }, [id]);

  useEffect(() => {
    if (proposalDetail && Object.keys(proposalDetail).length > 0) {
      // setProposalFormData({
      //   clientName: proposalDetail.clientName || "",
      //   clientCompany: proposalDetail.clientCompany || "",
      //   clientAddress: proposalDetail.clientAddress || "",
      //   dateOfProposal: proposalDetail.dateOfProposal?.split("T")[0] || "",
      //   GSTIN: proposalDetail.GSTIN || "",
      //   tanNo: proposalDetail.tanNo || "",
      //   validTill: proposalDetail.validTill?.split("T")[0] || "",
      //   paymentMethod: proposalDetail.paymentMethod || "",
      // });
      setSelectedServices(proposalDetail.services || []);
    }
  }, [proposalDetail]);

  if (loadingProposalDetails) {
    return <Loading />;
  }

  return (
    <div className="flex gap-5">
      <div className="">
        <form onSubmit={handleEditForm}>
          <div className="grid grid-cols-2 gap-2 px-3 py-2">
            <div className="flex flex-col gap-2">
              <Label>Client Name</Label>
              <Input
                name="clientName"
                value={proposalFormData.clientName}
                onChange={handleProposalFormChange}
                placeholder="Client Name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Client Company</Label>
              <Input
                name="clientCompany"
                value={proposalFormData.clientCompany}
                onChange={handleProposalFormChange}
                placeholder="Client Company"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Client Address</Label>
              <Input
                name="clientAddress"
                value={proposalFormData.clientAddress}
                onChange={handleProposalFormChange}
                placeholder="Client Address"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>GSTIN</Label>
              <Input
                name="GSTIN"
                value={proposalFormData.GSTIN}
                onChange={handleProposalFormChange}
                placeholder="GSTIN"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>TAN No</Label>
              <Input
                name="tanNo"
                value={proposalFormData.tanNo}
                onChange={handleProposalFormChange}
                placeholder="TAN No"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Date Of Proposal</Label>
              <Input
                type="date"
                name="dateOfProposal"
                value={proposalFormData.dateOfProposal}
                onChange={handleProposalFormChange}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Valid Till</Label>
              <Input
                type="date"
                name="validTill"
                value={proposalFormData.validTill}
                onChange={handleProposalFormChange}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Payment Method</Label>
              <Select
                value={proposalFormData.paymentMethod}
                onValueChange={handlePaymentMethodChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="net banking">Net Banking</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className={"w-full"}>
            Edit Proposals
          </Button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 py-3 ">
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

      <div className="w-1/3">
        <CommonForm
          formControls={ServiceFormControl}
          formData={
            editProposalServiceId ? proposalServiceEditData : serviceFormData
          }
          setFormData={
            editProposalServiceId
              ? setProposalServiceEditData
              : setServiceFormData
          }
          onSubmit={
            editProposalServiceId ? handleEditProposalService : handleService
          }
          buttonText={editProposalServiceId ? "Edit Service" : "Add Service"}
        />
      </div>
    </div>
  );
};

export default EditPropsal;
