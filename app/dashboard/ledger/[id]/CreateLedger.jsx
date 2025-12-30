"use client";
import {
  createLedgerService,
  fetchingProposalsInfo,
  ledgerEntriesService,
} from "@/service/ledger";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { customerLedgerService } from "@/service/customer";

const CreateLedgerPage = ({ proposalId }) => {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [formData, setFormData] = useState({});
  const [proposalDetails, setProposalDetails] = useState(null);
  const [ledgerData, setLedgerData] = useState(null);
  const [firstLedgerEntry, setFirstLedgerEntry] = useState(false);
  const router = useRouter();

  // loading
  const [loadingForProposalInfo, setLoadingForProposalInfo] = useState(true);
  const [loadingForLedgerDetails, setLoadingForLedgerDetails] = useState(true);

  async function fetchProposalInformation() {
    try {
      const res = await fetchingProposalsInfo(proposalId);
      if (res.success) {
        setLoadingForProposalInfo(false);
        setProposalDetails(res.data);
        fetchLedgerDetails(res?.data?.clientId);
      }
    } catch (error) {
      console.log(error);
      setLoadingForProposalInfo(true);
      toast.error(
        error.message || "error while fetching the proposal Information"
      );
    }
  }

  async function fetchLedgerDetails(id) {
    try {
      const res = await customerLedgerService(id);
      if (res.success) {
        setLoadingForLedgerDetails(false);
        setLedgerData(res.data);
        setFirstLedgerEntry(res.data?.ledger?.entries?.length > 0);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    setFormData({}); // Reset form data when payment method changes
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // for the proposal entry
  const handleSubmit = async (e) => {
    e.preventDefault();

    toast.success("handleSubmit");

    const submissionData = {
      paymentMethod,
      ...formData,
    };

    const formDataLedger = {
      customerId: proposalDetails?.clientId,
      proposalId: proposalDetails?._id,
      entries: [
        {
          date: submissionData?.entryDate,
          voucher: submissionData?.paymentMethod,
          debit: 0,
          credit: 0,
          balance:
            proposalDetails?.totalAmount +
            proposalDetails?.totalAmount * 0.18 -
            (proposalDetails?.tanNo ? proposalDetails?.totalAmount * 0.02 : 0),
          particular: {
            description: `Proposal #${proposalDetails?.proposalNo}`,
            items: [
              {
                subDescription: "18% GST",
                price: proposalDetails?.totalAmount * 0.18,
              },
              {
                subDescription: "Service Amount",
                price: proposalDetails?.totalAmount,
              },
              ...(proposalDetails?.tanNo
                ? [
                    {
                      subDescription: "2% TDS",
                      price: proposalDetails?.totalAmount * 0.02,
                    },
                  ]
                : []),
              {
                subDescription: "Total Amount",
                price:
                  proposalDetails?.totalAmount +
                  proposalDetails?.totalAmount * 0.18 -
                  (proposalDetails?.tanNo
                    ? proposalDetails?.totalAmount * 0.02
                    : 0),
              },
            ],
          },
          chequeDetails:
            submissionData?.paymentMethod === "cheque"
              ? {
                  chequeNumber: submissionData?.chequeNumber,
                  accountNo: submissionData?.accountNo,
                  chequeDate: submissionData?.chequeDate,
                  chequeAmount: submissionData?.amount,
                  bankName: submissionData?.bankName,
                  branchName: submissionData?.branchName,
                  ifscCode: submissionData?.ifscCode,
                }
              : {},
          net_banking:
            submissionData?.paymentMethod === "net-banking"
              ? {
                  transactionId: submissionData?.transactionId,
                  transactionDate: submissionData?.transactionDate,
                  transactionAmount: submissionData?.amount,
                }
              : {},
          upi:
            submissionData?.paymentMethod === "upi"
              ? {
                  upi_id: submissionData?.upiId,
                  payerName: submissionData?.payerName,
                  transactionId: submissionData?.upiTransactionId,
                }
              : {},
          credit_debit_card:
            submissionData?.paymentMethod === "card"
              ? {
                  card_type: submissionData?.cardType,
                  cardLastNo: submissionData?.last4Digits,
                  bankName: submissionData?.issuingBank,
                  cardHolderName: submissionData?.cardholderName,
                }
              : {},
        },
      ],
    };

    try {
      const res = await createLedgerService(formDataLedger);
      if (res.success) {
        toast.success("Ledger Entry create successfully");
        router.push("/dashboard/customer");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Error while create ledger");
    }
  };

  // this is the main entry function
  async function handleEntrySubmit(e) {
    e.preventDefault();

    toast.success("handleEntrySubmit");
    const submissionData = {
      paymentMethod,
      ...formData,
    };

    if (
      Number(submissionData?.amount) >
      ledgerData?.ledger?.entries?.at(-1)?.balance
    ) {
      toast.error(
        `Balance is less than the Amount. remaining balance ${ledgerData.ledger?.entries
          .at(-1)
          .balance.toLocaleString("en-IN")} `
      );
      return;
    }

    const formDataLedger = {
      date: submissionData?.entryDate,
      voucher: submissionData?.paymentMethod,
      debit: 0,
      credit: Number(submissionData?.amount),
      balance: Number(
        ledgerData?.ledger?.entries?.at(-1)?.balance - submissionData?.amount
      ),
      particular: {
        description: submissionData?.description,
        items: [
          {
            subDescription: "18% GST",
            price: submissionData?.amount * 0.18,
          },
          ...(proposalDetails?.tanNo
            ? [
                {
                  subDescription: "2% TDS",
                  price: submissionData?.amount * 0.02,
                },
              ]
            : []),
          {
            subDescription: "Total Amount",
            price: Number(submissionData?.amount),
          },
        ],
      },
      chequeDetails:
        submissionData?.paymentMethod === "cheque"
          ? {
              chequeNumber: submissionData?.chequeNumber,
              accountNo: submissionData?.accountNo,
              chequeDate: submissionData?.chequeDate,
              chequeAmount: submissionData?.amount,
              bankName: submissionData?.bankName,
              branchName: submissionData?.branchName,
              ifscCode: submissionData?.ifscCode,
            }
          : {},
      net_banking:
        submissionData?.paymentMethod === "net-banking"
          ? {
              transactionId: submissionData?.transactionId,
              transactionDate: submissionData?.transactionDate,
              transactionAmount: submissionData?.amount,
            }
          : {},
      upi:
        submissionData?.paymentMethod === "upi"
          ? {
              upi_id: submissionData?.upiId,
              payerName: submissionData?.payerName,
              transactionId: submissionData?.upiTransactionId,
            }
          : {},
      credit_debit_card:
        submissionData?.paymentMethod === "card"
          ? {
              card_type: submissionData?.cardType,
              cardLastNo: submissionData?.last4Digits,
              bankName: submissionData?.issuingBank,
              cardHolderName: submissionData?.cardholderName,
            }
          : {},
    };

    try {
      const res = await ledgerEntriesService(
        ledgerData?.ledger?._id,
        formDataLedger
      );

      if (res.success) {
        setPaymentMethod("");
        setFormData({});
        router.push("/dashboard/customer");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Error while create entries");
    }
  }

  useEffect(() => {
    fetchProposalInformation();
  }, []);

  const renderChequeForm = () => (
    <div className="grid grid-cols-2 gap-3">
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="description"
        >
          Particular Description
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="description"
          type="text"
          placeholder="Enter Particular description"
          value={formData.description || ""}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="chequeNumber"
        >
          Cheque Number
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="chequeNumber"
          type="text"
          placeholder="Enter Cheque Number"
          value={formData.chequeNumber || ""}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="chequeDate"
        >
          Cheque Date
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="chequeDate"
          type="date"
          value={formData.chequeDate || ""}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="amount"
        >
          Amount
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="amount"
          type="number"
          placeholder="Enter Amount"
          value={formData.amount || ""}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="accountNo"
        >
          Account No
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="accountNo"
          type="number"
          placeholder="Enter Account No"
          value={formData.accountNo || ""}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="bankName"
        >
          Bank Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="bankName"
          type="text"
          placeholder="Enter Bank Name"
          value={formData.bankName || ""}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="branchName"
        >
          Branch Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="branchName"
          type="text"
          placeholder="Enter Branch Name"
          value={formData.branchName || ""}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="ifscCode"
        >
          IFSC Code
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="ifscCode"
          type="text"
          placeholder="Enter IFSC Code"
          value={formData.ifscCode || ""}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="entryDate"
        >
          Entry Date
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="entryDate"
          type="date"
          value={formData.entryDate || ""}
          onChange={handleChange}
          required
        />
      </div>
    </div>
  );

  const renderNetBankingForm = () => (
    <div className="grid grid-cols-2 gap-3">
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="description"
        >
          Particular Description
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="description"
          type="text"
          placeholder="Enter Particular description"
          value={formData.description || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="transactionId"
        >
          Transaction ID / UTR
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="transactionId"
          type="text"
          placeholder="Enter Transaction ID / UTR"
          value={formData.transactionId || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="transactionDate"
        >
          Transaction Date
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="transactionDate"
          type="date"
          value={formData.transactionDate || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="amount"
        >
          Amount
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="amount"
          type="number"
          placeholder="Enter Amount"
          value={formData.amount || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="entryDate"
        >
          Entry Date
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="entryDate"
          type="date"
          value={formData.entryDate || ""}
          onChange={handleChange}
        />
      </div>
    </div>
  );

  const renderUpiForm = () => (
    <div className="grid grid-cols-2 gap-3">
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="description"
        >
          Particular Description
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="description"
          type="text"
          placeholder="Enter Particular description"
          value={formData.description || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="upiId"
        >
          UPI ID
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="upiId"
          type="text"
          placeholder="Enter UPI ID"
          value={formData.upiId || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="payerName"
        >
          Payer Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="payerName"
          type="text"
          placeholder="Enter Payer Name"
          value={formData.payerName || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="amount"
        >
          Amount
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="amount"
          type="number"
          placeholder="Enter Amount"
          value={formData.amount || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="upiTransactionId"
        >
          UPI Transaction ID / UTR
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="upiTransactionId"
          type="text"
          placeholder="Enter UPI Transaction ID / UTR"
          value={formData.upiTransactionId || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="entryDate"
        >
          Entry Date
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="entryDate"
          type="date"
          value={formData.entryDate || ""}
          onChange={handleChange}
        />
      </div>
    </div>
  );

  const renderCardForm = () => (
    <div className="grid grid-cols-2 gap-3">
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="description"
        >
          Particular Description
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="description"
          type="text"
          placeholder="Enter Particular description"
          value={formData.description || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="cardType"
        >
          Card Type
        </label>
        <select
          id="cardType"
          className="shadow border rounded w-full py-2 px-3 text-gray-700"
          value={formData.cardType || ""}
          onChange={handleChange}
        >
          <option value="">Select Card Type</option>
          <option value="credit">Credit Card</option>
          <option value="debit">Debit Card</option>
        </select>
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="last4Digits"
        >
          Last 4 Digits
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="last4Digits"
          type="text"
          maxLength="4"
          placeholder="Enter Last 4 Digits"
          value={formData.last4Digits || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="issuingBank"
        >
          Issuing Bank
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="issuingBank"
          type="text"
          placeholder="Enter Issuing Bank"
          value={formData.issuingBank || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="cardholderName"
        >
          Cardholder Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="cardholderName"
          type="text"
          placeholder="Enter Cardholder Name"
          value={formData.cardholderName || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="entryDate"
        >
          Entry Date
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="entryDate"
          type="date"
          value={formData.entryDate || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="amount"
        >
          Amount
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          id="amount"
          type="number"
          placeholder="Enter Amount"
          value={formData.amount || ""}
          onChange={handleChange}
        />
      </div>
    </div>
  );

  const renderEntryDetails = (item) => {
    if (!item) return null;

    switch (item.voucher) {
      case "cheque":
        return (
          <>
            {item.chequeDetails?.chequeNumber && (
              <div>Cheque Number : {item.chequeDetails.chequeNumber}</div>
            )}
            {item.chequeDetails?.chequeDate && (
              <div>
                Cheque Date :{" "}
                {new Date(item.chequeDetails.chequeDate).toLocaleDateString(
                  "en-GB"
                )}
              </div>
            )}
            {item.chequeDetails?.bankName && (
              <div>Bank Name : {item.chequeDetails.bankName}</div>
            )}
            {item.chequeDetails?.branchName && (
              <div>Branch Name : {item.chequeDetails.branchName}</div>
            )}
            {item.chequeDetails?.ifscCode && (
              <div>IFSC Code : {item.chequeDetails.ifscCode}</div>
            )}
          </>
        );
      case "net-banking":
        return (
          <>
            {item.net_banking?.transactionId && (
              <div>Transaction ID : {item.net_banking.transactionId}</div>
            )}
            {item.net_banking?.transactionDate && (
              <div>
                Transaction Date :{" "}
                {new Date(item.net_banking.transactionDate).toLocaleDateString(
                  "en-GB"
                )}
              </div>
            )}
          </>
        );
      case "upi":
        return (
          <>
            {item.upi?.upi_id && <div>UPI ID : {item.upi.upi_id}</div>}
            {item.upi?.payerName && (
              <div>Payer Name : {item.upi.payerName}</div>
            )}
            {item.upi?.transactionId && (
              <div>Transaction ID : {item.upi.transactionId}</div>
            )}
          </>
        );
      case "card":
        return (
          <>
            {item.credit_debit_card?.card_type && (
              <div>Card Type : {item.credit_debit_card.card_type}</div>
            )}
            {item.credit_debit_card?.cardLastNo && (
              <div>Last 4 Digits : {item.credit_debit_card.cardLastNo}</div>
            )}
            {item.credit_debit_card?.bankName && (
              <div>Issuing Bank : {item.credit_debit_card.bankName}</div>
            )}
            {item.credit_debit_card?.cardHolderName && (
              <div>
                Cardholder Name : {item.credit_debit_card.cardHolderName}
              </div>
            )}
          </>
        );
      default:
        return <div>No details available for this transaction type.</div>;
    }
  };

  console.log(firstLedgerEntry, "firstLedgerEntry");
  return (
    <>
      {loadingForProposalInfo ? (
        <>Loading...</>
      ) : (
        <div className="flex gap-5 flex-col md:flex-row lg:px-20">
          <div className="p-2 md:w-1/2">
            <h1 className="text-2xl font-bold text-center mb-2">
              Transation Details
            </h1>
            <form
              className="bg-white shadow-md rounded-xl px-8 pt-6 pb-8 mb-4"
              onSubmit={firstLedgerEntry ? handleEntrySubmit : handleSubmit}
            >
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="paymentMethod"
                >
                  Method of Payment
                </label>
                <select
                  id="paymentMethod"
                  onChange={handlePaymentMethodChange}
                  value={paymentMethod}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700"
                >
                  <option value="">Select a method</option>
                  <option value="cheque">Cheque</option>
                  <option value="net-banking">Net Banking</option>
                  <option value="upi">UPI</option>
                  <option value="card">Credit/Debit Card</option>
                </select>
              </div>
              {paymentMethod === "cheque" && renderChequeForm()}
              {paymentMethod === "net-banking" && renderNetBankingForm()}
              {paymentMethod === "upi" && renderUpiForm()}
              {paymentMethod === "card" && renderCardForm()}
              {paymentMethod && (
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white w-full font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Submit
                </button>
              )}
            </form>
          </div>

          <div className="md:w-1/2">
            <div className="my-5 border py-3 px-5 rounded-2xl flex flex-col space-y-2 w-[50%] ">
              <div className="bg-blue-500 w-32 flex items-center justify-center rounded-2xl p-1 font-semibold">
                {proposalDetails?.proposalNo}
              </div>
              <div className="font-semibold">
                Deal Amount: ₹{" "}
                {(
                  proposalDetails?.totalAmount +
                  proposalDetails?.totalAmount * 0.18 -
                  (proposalDetails.tanNo
                    ? proposalDetails?.totalAmount * 0.02
                    : 0)
                ).toLocaleString("en-IN")}
              </div>

              <div className="font-semibold">
                Base Amount: ₹{" "}
                {proposalDetails?.totalAmount.toLocaleString("en-IN")}
              </div>

              <div className="font-semibold">
                GST Amount(18%): ₹{" "}
                {(proposalDetails?.totalAmount * 0.18).toLocaleString("en-IN")}
              </div>

              {proposalDetails.tanNo && (
                <div className="font-semibold">
                  TDS Amount (2%): ₹{" "}
                  {(proposalDetails?.totalAmount * 0.02).toLocaleString(
                    "en-IN"
                  )}
                </div>
              )}
            </div>

            {ledgerData?.ledger?.entries?.length > 1 && (
              <div>
                <Accordion
                  type="single"
                  collapsible
                  className="w-full"
                  defaultValue="item-1"
                >
                  {ledgerData?.ledger?.entries?.slice(1)?.map((item) => (
                    <AccordionItem value={item?._id} key={item?._id}>
                      <AccordionTrigger>
                        <div className="flex gap-10 w-full text-left">
                          <div className="capitalize w-1/4">
                            {item?.voucher}
                          </div>
                          <div className="text-blue-400 w-1/4">
                            ₹ {item?.credit?.toLocaleString("en-IN")}
                          </div>
                          <div className="w-1/4">
                            {new Date(item?.date).toLocaleDateString("en-GB")}
                          </div>
                          <div className="w-1/4">
                            ₹ {item?.balance?.toLocaleString("en-IN")}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="grid grid-cols-2 gap-4 text-balance">
                        {renderEntryDetails(item)}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CreateLedgerPage;
