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
  const router = useRouter();

  const [loadingProposalDetails, setLoadingProposalDetails] = useState(true);
  const [proposalDetail, setProposalDetail] = useState({});

  const [servicesItem, setServicesItem] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  const [editProposalServiceId, setEditProposalServiceId] = useState(null);
  const [proposalServiceEditData, setProposalServiceEditData] = useState(
    initalServiceFormData,
  );

  const [serviceFormData, setServiceFormData] = useState(initalServiceFormData);

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

  const [listOfPayments, setListOfPayments] = useState([]);
  const [partlyPaymentFormData, setPartlyPaymentFormData] = useState({
    paymentDuration: "",
    paymentAmount: "",
  });

  function formatDate(date) {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  }

  /* ---------------- SERVICE CALCULATION ---------------- */

  function calculationOfTotalAmount() {
    return selectedServices.reduce((total, service) => {
      let servicePrice = service.amount;

      if (service.discountAmount) {
        servicePrice -= service.discountAmount;
      } else if (service.discountPercentage) {
        servicePrice -= (service.amount * service.discountPercentage) / 100;
      }

      return total + servicePrice;
    }, 0);
  }

  const totalService = calculationOfTotalAmount();
  const gstAmount = totalService * 0.18;
  const grandTotal = totalService + gstAmount;
  const tdsAmount = totalService * 0.02;

  const finalTotal = proposalFormData.tanNo
    ? grandTotal - tdsAmount
    : grandTotal;

  /* ---------------- HANDLE EDIT SUBMIT ---------------- */

  async function handleEditForm(e) {
    e.preventDefault();

    const filledItems = {};

    for (const key in proposalFormData) {
      if (proposalFormData[key]) {
        filledItems[key] = proposalFormData[key];
      }
    }

    filledItems.services = selectedServices.map((s) => s._id);
    filledItems.totalAmount = totalService;
    filledItems.partlyPayment = listOfPayments;

    try {
      const res = await editProposalService(id, filledItems);

      if (res.success) {
        toast.success("Proposal Updated");
        router.push("/dashboard/customer");
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Update failed");
    }
  }

  /* ---------------- FETCH PROPOSAL ---------------- */

  async function fetchProposalDetails() {
    try {
      const res = await getProposalDetail(id);

      if (res.success) {
        const data = res.data;

        setProposalDetail(data);

        setProposalFormData({
          clientName: data.clientName || "",
          clientCompany: data.clientCompany || "",
          clientAddress: data.clientAddress || "",
          GSTIN: data.GSTIN || "",
          tanNo: data.tanNo || "",
          paymentMethod: data.paymentMethod || "",
          dateOfProposal: formatDate(data.dateOfProposal),
          validTill: formatDate(data.validTill),
        });

        setSelectedServices(data.services || []);
        setListOfPayments(data.partlyPayment || []);

        setLoadingProposalDetails(false);
      }
    } catch (error) {
      toast.error("Error fetching proposal");
    }
  }

  async function fetchAllServices() {
    try {
      const response = await getAllService();
      if (response.success) {
        setServicesItem(response.data);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  /* ---------------- SELECT SERVICE ---------------- */

  const handleSelectService = (service) => {
    setSelectedServices((prev) => {
      const exists = prev.some((s) => s._id === service._id);

      if (exists) {
        return prev.filter((s) => s._id !== service._id);
      } else {
        return [...prev, service];
      }
    });
  };

  /* ---------------- PARTIAL PAYMENT ---------------- */

  function handleAddPayment(e) {
    e.preventDefault();

    const amount = Number(partlyPaymentFormData.paymentAmount);

    if (!partlyPaymentFormData.paymentDuration) {
      toast.error("Select payment duration");
      return;
    }

    if (amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    const paid = listOfPayments.reduce(
      (acc, curr) => acc + Number(curr.paymentAmount),
      0,
    );

    const remaining = finalTotal - paid;

    if (amount > remaining) {
      toast.error(`Cannot exceed remaining ₹${remaining}`);
      return;
    }

    setListOfPayments([partlyPaymentFormData, ...listOfPayments]);

    setPartlyPaymentFormData({
      paymentDuration: "",
      paymentAmount: "",
    });
  }

  function handleDeletePayment(index) {
    setListOfPayments((prev) => prev.filter((_, i) => i !== index));
  }

  /* ---------------- SERVICES CRUD ---------------- */

  async function handleService(e) {
    e.preventDefault();

    try {
      const res = await createServicesService(serviceFormData);

      if (res.success) {
        toast.success(res.message);
        setServiceFormData(initalServiceFormData);
        fetchAllServices();
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function handleDeleteService(id) {
    const confirm = window.confirm("Delete service?");

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
      setProposalServiceEditData(res.data);
    }
  }

  async function handleEditProposalService(e) {
    e.preventDefault();

    const res = await editService(
      editProposalServiceId,
      proposalServiceEditData,
    );

    if (res.success) {
      toast.success("Service updated");
      setEditProposalServiceId(null);
      fetchAllServices();
    }
  }

  useEffect(() => {
    fetchProposalDetails();
    fetchAllServices();
  }, [id]);

  if (loadingProposalDetails) return <Loading />;

  return (
    <div className="grid grid-cols-3 gap-5">
      {/* LEFT SIDE */}
      <div className="col-span-2">
        <form onSubmit={handleEditForm} className="grid grid-cols-2 gap-3">
          <div>
            <Label>Client Name</Label>
            <Input
              name="clientName"
              value={proposalFormData.clientName}
              onChange={(e) =>
                setProposalFormData({
                  ...proposalFormData,
                  clientName: e.target.value,
                })
              }
            />
          </div>

          <div>
            <Label>Client Company</Label>
            <Input
              name="clientCompany"
              value={proposalFormData.clientCompany}
              onChange={(e) =>
                setProposalFormData({
                  ...proposalFormData,
                  clientCompany: e.target.value,
                })
              }
            />
          </div>

          <div>
            <Label>GSTIN</Label>
            <Input
              name="GSTIN"
              value={proposalFormData.GSTIN}
              onChange={(e) =>
                setProposalFormData({
                  ...proposalFormData,
                  GSTIN: e.target.value,
                })
              }
            />
          </div>

          <div>
            <Label>TAN No</Label>
            <Input
              name="tanNo"
              value={proposalFormData.tanNo}
              onChange={(e) =>
                setProposalFormData({
                  ...proposalFormData,
                  tanNo: e.target.value,
                })
              }
            />
          </div>

          <Button className="col-span-2 mt-3">Update Proposal</Button>
        </form>

        {/* SERVICES */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {servicesItem.map((item) => (
            <div key={item._id} className="border rounded-lg p-4">
              <button
                type="button"
                onClick={() => handleSelectService(item)}
                className={`w-full text-left ${
                  selectedServices.some((s) => s._id === item._id)
                    ? "bg-blue-100"
                    : ""
                }`}
              >
                <p className="font-semibold">{item.serviceTitle}</p>
                <p>{item.description}</p>
                <p>₹ {item.amount}</p>
              </button>

              <div className="flex justify-between mt-2">
                <Edit
                  size={18}
                  className="cursor-pointer"
                  onClick={() => getProposalServiceIdForEdit(item._id)}
                />

                <Trash
                  size={18}
                  className="cursor-pointer"
                  onClick={() => handleDeleteService(item._id)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div>
        {/* PAYMENT SUMMARY */}

        <div className="bg-white p-4 rounded-lg shadow border mb-4">
          <h2 className="font-bold mb-3">Payment Summary</h2>

          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹ {totalService}</span>
          </div>

          <div className="flex justify-between">
            <span>GST 18%</span>
            <span>₹ {gstAmount}</span>
          </div>

          {proposalFormData.tanNo && (
            <div className="flex justify-between">
              <span>TDS 2%</span>
              <span>₹ {tdsAmount}</span>
            </div>
          )}

          <div className="flex justify-between font-bold border-t mt-2 pt-2">
            <span>Total</span>
            <span>₹ {finalTotal}</span>
          </div>
        </div>

        {/* PARTIAL PAYMENT */}

        <form onSubmit={handleAddPayment} className="flex flex-col gap-2">
          <select
            value={partlyPaymentFormData.paymentDuration}
            onChange={(e) =>
              setPartlyPaymentFormData({
                ...partlyPaymentFormData,
                paymentDuration: e.target.value,
              })
            }
          >
            <option value="">Select Duration</option>
            <option value="Advance Payment">Advance Payment</option>
            <option value="After 30 Days">After 30 Days</option>
            <option value="After 60 Days">After 60 Days</option>
          </select>

          <Input
            type="number"
            placeholder="Amount"
            value={partlyPaymentFormData.paymentAmount}
            onChange={(e) =>
              setPartlyPaymentFormData({
                ...partlyPaymentFormData,
                paymentAmount: e.target.value,
              })
            }
          />

          <Button>Add Payment</Button>
        </form>

        {listOfPayments.map((item, index) => (
          <div key={index} className="flex justify-between border p-2 mt-2">
            <span>{item.paymentDuration}</span>
            <span>₹ {item.paymentAmount}</span>

            <Trash
              size={16}
              className="cursor-pointer"
              onClick={() => handleDeletePayment(index)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditPropsal;
