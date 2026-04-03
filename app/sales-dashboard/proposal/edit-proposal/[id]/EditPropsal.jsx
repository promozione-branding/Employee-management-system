"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
  editProposalService,
  getProposalByIdService,
} from "@/service/proposal";
import { useRouter } from "next/navigation";

export default function ServiceEditor({ proposalId }) {
  const [services, setServices] = useState([]);
  const [proposalDetails, setProposalDetails] = useState(null);
  const [partlyPayment, setPartlyPayment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notesData, setNotesData] = useState("");

  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getProposalByIdService(proposalId);
        setProposalDetails(res?.data);
        setServices(res?.data?.services || []);
        setPartlyPayment(res?.data?.partlyPayment || []);
        setNotesData(res?.data?.notes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [proposalId]);

  // --- Dynamic Calculations ---
  function calculationOfTotalAmount() {
    return services.reduce((total, service) => {
      let servicePrice = Number(service.amount || 0);
      if (service.discountAmount) {
        servicePrice -= Number(service.discountAmount);
      } else if (service.discountPercentage) {
        servicePrice -=
          (servicePrice * Number(service.discountPercentage)) / 100;
      }
      return total + servicePrice;
    }, 0);
  }

  const totalService = calculationOfTotalAmount();
  const gstAmount = totalService * 0.18;
  const grandTotal = totalService + gstAmount;
  const tdsAmount = totalService * 0.02;
  const tanNo = proposalDetails?.tanNo;
  const finalTotal = tanNo ? grandTotal - tdsAmount : grandTotal;

  const totalPaid = partlyPayment.reduce(
    (acc, curr) => acc + Number(curr.paymentAmount || 0),
    0,
  );
  const remainingAmount = finalTotal - totalPaid;
  // ----------------------------

  const handleChange = (index, field, value) => {
    const updated = [...services];
    updated[index][field] = value;

    // Auto calculate final amount
    const amount = Number(updated[index].amount || 0);
    const discountPercentage = Number(updated[index].discountPercentage || 0);
    const discountAmount = Number(updated[index].discountAmount || 0);

    if (discountPercentage) {
      updated[index].finalAmount = amount - (amount * discountPercentage) / 100;
    } else {
      updated[index].finalAmount = amount - discountAmount;
    }

    setServices(updated);
  };

  const handlePaymentChange = (index, field, value) => {
    const updated = [...partlyPayment];
    updated[index][field] = value;

    if (field === "paymentAmount") {
      const newTotalPaid = updated.reduce(
        (acc, curr) => acc + Number(curr.paymentAmount || 0),
        0,
      );
      if (newTotalPaid > finalTotal) {
        toast.error("Total partial payment amount exceeds the total amount!");
      }
    }
    setPartlyPayment(updated);
  };

  const addPayment = () => {
    setPartlyPayment([
      ...partlyPayment,
      { paymentDuration: "", paymentAmount: "" },
    ]);
  };

  const addService = () => {
    setServices([
      ...services,
      {
        serviceTitle: "",
        amount: "",
        duration: "",
        description: "",
        discountAmount: "",
        discountPercentage: "",
        finalAmount: 0,
      },
    ]);
  };

  const handleSave = async () => {
    if (remainingAmount > 0.5) {
      toast.error("Partial payment amount is lower than the total amount");
      return;
    }
    if (remainingAmount < -0.5) {
      toast.error("Partial payment amount exceeds the total amount");
      return;
    }

    // Validation: Ensure Service Title, Amount, and Duration are filled for all added services
    for (const service of services) {
      if (
        !service.serviceTitle?.trim() ||
        !service.amount ||
        !service.duration?.trim()
      ) {
        toast.error("Service Title, Amount, and Duration are mandatory");
        return;
      }
    }

    for (const payment of partlyPayment) {
      if (!payment.paymentDuration?.trim() || !payment.paymentAmount) {
        toast.error("Please add Service duration & Amount");
      }
    }

    const payload = {
      services,
      partlyPayment,
      totalAmount: finalTotal,
    };

    if (notesData?.trim()) {
      payload.notes = notesData;
    }

    try {
      const res = await editProposalService(proposalId, payload);
      if (res.success) {
        toast.success("Proposal edit successfully");
        router.push(`/sales-dashboard/proposal/pdf-download/${proposalId}`);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "error while editing the");
      console.log(error);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold">Edit Services</h1>

      <div className="flex flex-col lg:flex-row">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:w-1/2 lg:border-r">
          {services.map((service, index) => (
            <div key={index} className="shadow-md rounded-2xl border px-2 py-1">
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2  gap-4">
                <Input
                  placeholder="Service Title"
                  value={service.serviceTitle}
                  required
                  onChange={(e) =>
                    handleChange(index, "serviceTitle", e.target.value)
                  }
                />

                <Input
                  type="number"
                  placeholder="Amount"
                  required
                  value={service.amount}
                  onChange={(e) =>
                    handleChange(index, "amount", e.target.value)
                  }
                />

                <Input
                  placeholder="Duration"
                  value={service.duration}
                  required
                  onChange={(e) =>
                    handleChange(index, "duration", e.target.value)
                  }
                />

                <Input
                  type="number"
                  placeholder="Discount %"
                  value={service.discountPercentage}
                  onChange={(e) =>
                    handleChange(index, "discountPercentage", e.target.value)
                  }
                />

                <Input
                  type="number"
                  placeholder="Discount Amount"
                  value={service.discountAmount}
                  onChange={(e) =>
                    handleChange(index, "discountAmount", e.target.value)
                  }
                />

                <Input
                  type="number"
                  placeholder="Final Amount"
                  value={service.finalAmount}
                  disabled
                />

                <Textarea
                  className="md:col-span-2"
                  placeholder="Description"
                  required
                  value={service.description}
                  onChange={(e) =>
                    handleChange(index, "description", e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <div className="lg:w-1/2 lg:pl-6 mt-6 lg:mt-0 space-y-4">
          <div>
            <div>
              <div className="flex gap-2 items-center mb-2">
                <label htmlFor="">Note:</label>
                <Input
                  type="text"
                  placeholder="Notes"
                  value={notesData}
                  onChange={(e) => setNotesData(e.target.value)}
                />
              </div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                Payment Summary
              </h2>
              <div className="space-y-0.5">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹ {totalService.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span>₹ {gstAmount.toLocaleString("en-IN")}</span>
                </div>

                {tanNo && (
                  <div className="flex justify-between text-gray-600">
                    <span>TDS (2%)</span>
                    <span>₹ {tdsAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-lg text-gray-900 border-t pt-2 mt-2">
                  <span>Total Amount</span>
                  <span>₹ {finalTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold">Partial Payments</h2>
              <div className="">
                {partlyPayment.map((payment, index) => (
                  <div key={index} className="py-0.5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Payment Duration (e.g. Advance)"
                        value={payment.paymentDuration}
                        onChange={(e) =>
                          handlePaymentChange(
                            index,
                            "paymentDuration",
                            e.target.value,
                          )
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={payment.paymentAmount}
                        onChange={(e) =>
                          handlePaymentChange(
                            index,
                            "paymentAmount",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 font-semibold text-sm">
                <span
                  className={
                    remainingAmount !== 0 ? "text-red-500" : "text-green-600"
                  }
                >
                  Remaining Amount: ₹ {remainingAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          <Button variant="outline" onClick={addPayment} className="w-full">
            + Add Payment Step
          </Button>
        </div>
      </div>

      <Button onClick={addService} className="rounded-xl">
        + Add Service
      </Button>

      <Button onClick={handleSave} className="w-full rounded-xl">
        Save Changes
      </Button>
    </div>
  );
}
