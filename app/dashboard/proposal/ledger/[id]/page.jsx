"use client";
import React, { useState } from "react";

const CreateLedgerPage = () => {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [formData, setFormData] = useState({});

  //   ----------------payment Entries State---------------
  const [paymentEntriesFormData, setPaymentEntriesFormData] = useState({
    description: "",
    paymentAmount: "",
  });

  const [listOfPayments, setListOfPayments] = useState([]);

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    setFormData({}); // Reset form data when payment method changes
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can now access the full form data here
    const submissionData = {
      paymentMethod,
      ...formData,
    };
    console.log("Form Submitted:", submissionData);
  };

  const renderChequeForm = () => (
    <>
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
        />
      </div>
    </>
  );

  const renderNetBankingForm = () => (
    <>
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
    </>
  );

  const renderUpiForm = () => (
    <>
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
    </>
  );

  const renderCardForm = () => (
    <>
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
    </>
  );

  return (
    <div className="flex gap-5 flex-col md:flex-row lg:px-20">
      <div className="p-4 md:w-1/2">
        <h1 className="text-2xl font-bold text-center mb-6">
          Transation Details
        </h1>
        <form
          className="bg-white shadow-md rounded-xl px-8 pt-6 pb-8 mb-4"
          onSubmit={handleSubmit}
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
        <h1 className="text-2xl font-bold text-center mb-6">Payment Entires</h1>

        <form>
          <div className="grid grid-cols-2 gap-5">
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="descriptionOfPayment"
              >
                Description of Payment
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                id="descriptionOfPayment"
                type="text"
                placeholder="Enter payment Description"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="paymentAmount"
              >
                Payment Amount
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                id="paymentAmount"
                type="text"
                placeholder="Enter Payment Amount"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white w-full font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline "
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateLedgerPage;
