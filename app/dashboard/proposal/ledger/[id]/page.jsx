// app/dashboard/proposal/ledger/[id]/page.jsx

'use client';
import React, { useState } from 'react';

const CreateLedgerPage = () => {
    const [paymentMethod, setPaymentMethod] = useState('');
    const [formData, setFormData] = useState({});

    //   ----------------payment Entries State---------------
    const [paymentEntriesFormData, setPaymentEntriesFormData] = useState({
        description: '',
        paymentAmount: '',
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
        console.log('Form Submitted:', submissionData);
    };

    const handlePaymentEntriesChange = (e) => {
        const { name, value } = e.target;
        setPaymentEntriesFormData((prev) => ({ ...prev, [name]: value }));
    };

    const submitPaymentEntries = async (e) => {
        e.preventDefault();
        setListOfPayments((prevList) => [...prevList, paymentEntriesFormData]);
        setPaymentEntriesFormData({
            description: '',
            paymentAmount: '',
        });
    };

    const renderChequeForm = () => (
        <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="bankName">
                    Bank Name
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="bankName"
                    type="text"
                    placeholder="Enter Bank Name"
                    value={formData.bankName || ''}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="ifscCode">
                    IFSC Code
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="ifscCode"
                    type="text"
                    placeholder="Enter IFSC Code"
                    value={formData.ifscCode || ''}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="chequeNumber">
                    Cheque Number
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="chequeNumber"
                    type="text"
                    placeholder="Enter Cheque Number"
                    value={formData.chequeNumber || ''}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="amount">
                    Amount
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="amount"
                    type="number"
                    placeholder="Enter Amount"
                    value={formData.amount || ''}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="branchName">
                    Branch Name
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="branchName"
                    type="text"
                    placeholder="Enter Branch Name"
                    value={formData.branchName || ''}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="accountNumber">
                    Account Number
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="accountNumber"
                    placeholder="Enter Account No."
                    type="text"
                    value={formData.accountNumber || ''}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="chequeDate">
                    Cheque Date
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="chequeDate"
                    type="date"
                    value={formData.chequeDate || ''}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="entiresDate">
                    Entires Date
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="entiresDate"
                    type="date"
                    placeholder="Enter Entires Date"
                    value={formData.entiresDate || ''}
                    onChange={handleChange}
                />
            </div>
        </div>
    );

    const renderNetBankingForm = () => (
        <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="transactionId">
                    Transaction ID / UTR
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="transactionId"
                    type="text"
                    placeholder="Enter Transaction ID / UTR"
                    value={formData.transactionId || ''}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="transactionDate">
                    Transaction Date
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="transactionDate"
                    type="date"
                    value={formData.transactionDate || ''}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="amount">
                    Amount
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="amount"
                    type="number"
                    placeholder="Enter Amount"
                    value={formData.amount || ''}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="entiresDate">
                    Entires Date
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="entiresDate"
                    type="date"
                    placeholder="Enter Entires Date"
                    value={formData.entiresDate || ''}
                    onChange={handleChange}
                />
            </div>
        </div>
    );

    const renderUpiForm = () => (
        <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="upiId">
                    UPI ID
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="upiId"
                    type="text"
                    placeholder="Enter UPI ID"
                    value={formData.upiId || ''}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="payerName">
                    Payer Name
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="payerName"
                    type="text"
                    placeholder="Enter Payer Name"
                    value={formData.payerName || ''}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="amount">
                    Amount
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="amount"
                    type="number"
                    placeholder="Enter Amount"
                    value={formData.amount || ''}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="upiTransactionId">
                    UPI Transaction ID / UTR
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="upiTransactionId"
                    type="text"
                    placeholder="Enter UPI Transaction ID / UTR"
                    value={formData.upiTransactionId || ''}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="entiresDate">
                    Entires Date
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="entiresDate"
                    type="date"
                    placeholder="Enter Entires Date"
                    value={formData.entiresDate || ''}
                    onChange={handleChange}
                />
            </div>
        </div>
    );

    const renderCardForm = () => (
        <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="cardType">
                    Card Type
                </label>
                <select id="cardType" className="w-full rounded border px-3 py-2 text-gray-700 shadow" value={formData.cardType || ''} onChange={handleChange}>
                    <option value="">Select Card Type</option>
                    <option value="credit">Credit Card</option>
                    <option value="debit">Debit Card</option>
                </select>
            </div>
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="last4Digits">
                    Last 4 Digits
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="last4Digits"
                    type="text"
                    maxLength="4"
                    placeholder="Enter Last 4 Digits"
                    value={formData.last4Digits || ''}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="payerPhoneNumber">
                    Payer Phone Number
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="payerPhoneNumber"
                    type="text"
                    placeholder="Enter Phone Number"
                    value={formData.payerPhoneNumber || ''}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="payerName">
                    Payer Name
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="payerName"
                    type="text"
                    placeholder="Enter Payer Name"
                    value={formData.payerName || ''}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="entiresDate">
                    Entires Date
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="entiresDate"
                    type="date"
                    placeholder="Enter Entires Date"
                    value={formData.entiresDate || ''}
                    onChange={handleChange}
                />
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-5 md:flex-row lg:px-10">
            <div className="p-4 md:w-1/2">
                <h1 className="mb-6 text-center text-2xl font-bold">Transation Details</h1>
                <form className="mb-4 rounded-xl bg-white px-8 pt-6 pb-8 shadow-md" onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="paymentMethod">
                            Method of Payment
                        </label>
                        <select
                            id="paymentMethod"
                            onChange={handlePaymentMethodChange}
                            value={paymentMethod}
                            className="w-full rounded border px-3 py-2 text-gray-700 shadow"
                        >
                            <option value="">Select a method</option>
                            <option value="cheque">Cheque</option>
                            <option value="net-banking">Net Banking</option>
                            <option value="upi">UPI</option>
                            <option value="card">Credit/Debit Card</option>
                        </select>
                    </div>
                    {paymentMethod === 'cheque' && renderChequeForm()}
                    {paymentMethod === 'net-banking' && renderNetBankingForm()}
                    {paymentMethod === 'upi' && renderUpiForm()}
                    {paymentMethod === 'card' && renderCardForm()}
                    {paymentMethod && (
                        <button
                            type="submit"
                            className="focus:shadow-outline w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
                        >
                            Submit
                        </button>
                    )}
                </form>
            </div>

            <div className="md:w-1/2">
                <h1 className="mb-6 text-center text-2xl font-bold">Payment Entires</h1>

                <form onSubmit={submitPaymentEntries}>
                    <div className="grid grid-cols-2 gap-5">
                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="descriptionOfPayment">
                                Description of Payment
                            </label>
                            <input
                                className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                                id="description"
                                name="description"
                                type="text"
                                required
                                placeholder="Enter payment Description"
                                value={paymentEntriesFormData.description}
                                onChange={handlePaymentEntriesChange}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="paymentAmount">
                                Payment Amount
                            </label>
                            <input
                                required
                                value={paymentEntriesFormData.paymentAmount}
                                className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                                id="paymentAmount"
                                name="paymentAmount"
                                type="text"
                                placeholder="Enter Payment Amount"
                                onChange={handlePaymentEntriesChange}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="focus:shadow-outline w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
                    >
                        Add
                    </button>
                </form>

                <div>
                    {listOfPayments.length > 0 ? (
                        <div className="mt-4 space-y-2">
                            {listOfPayments?.map(({ description, paymentAmount }, idx) => (
                                <div key={idx} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 shadow-sm">
                                    <span className="text-gray-800">{description}</span>
                                    <span className="font-semibold text-gray-900">
                                        ₹
                                        {!isNaN(parseFloat(paymentAmount))
                                            ? parseFloat(paymentAmount).toLocaleString('en-IN', {
                                                  minimumFractionDigits: 2,
                                                  maximumFractionDigits: 2,
                                              })
                                            : '0.00'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="my-4 flex items-center justify-center rounded-2xl border-2 border-dashed p-5 text-xl text-gray-400">
                            Add some payment Entries
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateLedgerPage;
