// app/sales-dashboard/clients/ledger/[id]/CreateLedger.jsx

'use client';
import { createLedgerService, fetchingProposalsInfo, ledgerEntriesService } from '@/service/ledger';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { customerLedgerService } from '@/service/customer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Loading from '@/components/layout/Loading';

const CreateLedgerPage = ({ customerId }) => {
    const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    const [paymentMethod, setPaymentMethod] = useState('');
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
            toast.error(error.message || 'error while fetching the proposal Information');
        }
    }

    async function fetchLedgerDetails(id) {
        try {
            const res = await customerLedgerService(id);
            if (res.success) {
                setLoadingForLedgerDetails(false);
                setLedgerData(res.data);
            }
        } catch (error) {
            console.log(error);
            setLoadingForLedgerDetails(false);
            toast.error(error.message);
        }
    }

    const proposalDataEntriesData = ledgerData?.ledger?.entries?.filter((item) => item?.voucher === 'Proposal') || [];

    const paymentDataList = ledgerData?.ledger?.entries?.filter((item) => ['upi', 'card', 'net banking', 'cheque'].includes(item?.voucher)) || [];

    const handlePaymentMethodChange = (e) => {
        setPaymentMethod(e.target.value);
        setFormData({});
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        const normalizedValue = id === 'ifscCode' ? value.toUpperCase() : value;
        setFormData((prev) => ({ ...prev, [id]: normalizedValue }));
    };

    // for the proposal entry
    const handleSubmit = async (e) => {
        e.preventDefault();

        const submissionData = {
            paymentMethod,
            ...formData,
        };
        if (submissionData?.paymentMethod === 'cheque' && submissionData?.ifscCode && !IFSC_REGEX.test(submissionData.ifscCode)) {
            toast.error('Invalid IFSC Code');
            return;
        }

        const formDataLedger = {
            customerId: proposalDetails?.clientId,
            proposalIds: (prev) => [...prev, proposalDetails?._id],

            entries: [
                {
                    date: submissionData?.entryDate,
                    voucher: submissionData?.paymentMethod,
                    debit: 0,
                    credit: 0,
                    balance:
                        proposalDetails?.totalAmount + proposalDetails?.totalAmount * 0.18 - (proposalDetails?.tanNo ? proposalDetails?.totalAmount * 0.02 : 0),
                    particular: {
                        description: `Proposal #${proposalDetails?.proposalNo}`,
                        items: [
                            {
                                subDescription: '18% GST',
                                price: proposalDetails?.totalAmount * 0.18,
                            },
                            {
                                subDescription: 'Service Amount',
                                price: proposalDetails?.totalAmount,
                            },
                            ...(proposalDetails?.tanNo
                                ? [
                                      {
                                          subDescription: '2% TDS',
                                          price: proposalDetails?.totalAmount * 0.02,
                                      },
                                  ]
                                : []),
                            {
                                subDescription: 'Total Amount',
                                price:
                                    proposalDetails?.totalAmount +
                                    proposalDetails?.totalAmount * 0.18 -
                                    (proposalDetails?.tanNo ? proposalDetails?.totalAmount * 0.02 : 0),
                            },
                        ],
                    },
                    chequeDetails:
                        submissionData?.paymentMethod === 'cheque'
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
                        submissionData?.paymentMethod === 'net-banking'
                            ? {
                                  transactionId: submissionData?.transactionId,
                                  transactionDate: submissionData?.transactionDate,
                                  transactionAmount: submissionData?.amount,
                              }
                            : {},
                    upi:
                        submissionData?.paymentMethod === 'upi'
                            ? {
                                  upi_id: submissionData?.upiId,
                                  payerName: submissionData?.payerName,
                                  transactionId: submissionData?.upiTransactionId,
                              }
                            : {},
                    credit_debit_card:
                        submissionData?.paymentMethod === 'card'
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
                toast.success('Ledger Entry create successfully');
                router.push('/dashboard/customer');
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message || 'Error while create ledger');
        }
    };

    // this is the main entry function
    async function handleEntrySubmit(e) {
        e.preventDefault();

        const submissionData = {
            paymentMethod,
            ...formData,
        };

        if (submissionData?.paymentMethod === 'cheque' && submissionData?.ifscCode && !IFSC_REGEX.test(submissionData.ifscCode)) {
            toast.error('Invalid IFSC Code');
            return;
        }

        if (Number(submissionData?.amount) > ledgerData?.ledger?.entries?.at(-1)?.balance) {
            toast.error(`Balance is less than the Amount. remaining balance ${ledgerData.ledger?.entries.at(-1).balance.toLocaleString('en-IN')} `);
            return;
        }

        const formDataLedger = {
            date: submissionData?.entryDate,
            voucher: submissionData?.paymentMethod,
            debit: 0,
            credit: Number(submissionData?.amount),
            balance: Number(ledgerData?.ledger?.entries?.at(-1)?.balance - submissionData?.amount),
            particular: {
                description: submissionData?.description,
                items: [
                    {
                        subDescription: '18% GST',
                        price: submissionData?.amount * 0.18,
                    },
                    ...(proposalDetails?.tanNo
                        ? [
                              {
                                  subDescription: '2% TDS',
                                  price: submissionData?.amount * 0.02,
                              },
                          ]
                        : []),
                    {
                        subDescription: 'Total Amount',
                        price: Number(submissionData?.amount),
                    },
                ],
            },
            chequeDetails:
                submissionData?.paymentMethod === 'cheque'
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
                submissionData?.paymentMethod === 'net-banking'
                    ? {
                          transactionId: submissionData?.transactionId,
                          transactionDate: submissionData?.transactionDate,
                          transactionAmount: submissionData?.amount,
                      }
                    : {},
            upi:
                submissionData?.paymentMethod === 'upi'
                    ? {
                          upi_id: submissionData?.upiId,
                          payerName: submissionData?.payerName,
                          transactionId: submissionData?.upiTransactionId,
                      }
                    : {},
            credit_debit_card:
                submissionData?.paymentMethod === 'card'
                    ? {
                          card_type: submissionData?.cardType,
                          cardLastNo: submissionData?.last4Digits,
                          bankName: submissionData?.issuingBank,
                          cardHolderName: submissionData?.cardholderName,
                      }
                    : {},
        };

        try {
            const res = await ledgerEntriesService(ledgerData?.ledger?._id, {
                entriesData: formDataLedger,
            });

            if (res.success) {
                setPaymentMethod('');
                setFormData({});
                router.push('/dashboard/customer');
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message || 'Error while create entries');
        }
    }

    useEffect(() => {
        // fetchProposalInformation();
        if (customerId !== '') {
            fetchLedgerDetails(customerId);
        }
    }, [customerId]);

    const renderChequeForm = () => (
        <div className="grid grid-cols-2 gap-3">
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="description">
                    Particular Description
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="description"
                    type="text"
                    placeholder="Enter Particular description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    required
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
                    required
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
                    required
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
                    required
                />
            </div>
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="accountNo">
                    Account No
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="accountNo"
                    type="number"
                    placeholder="Enter Account No"
                    value={formData.accountNo || ''}
                    onChange={handleChange}
                    required
                />
            </div>
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
                    required
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
                    required
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
                    required
                />
            </div>
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="entryDate">
                    Entry Date
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="entryDate"
                    type="date"
                    value={formData.entryDate || ''}
                    onChange={handleChange}
                    required
                />
            </div>
        </div>
    );

    const renderNetBankingForm = () => (
        <div className="grid grid-cols-2 gap-3">
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="description">
                    Particular Description
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="description"
                    type="text"
                    placeholder="Enter Particular description"
                    value={formData.description || ''}
                    onChange={handleChange}
                />
            </div>
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
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="entryDate">
                    Entry Date
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="entryDate"
                    type="date"
                    value={formData.entryDate || ''}
                    onChange={handleChange}
                />
            </div>
        </div>
    );

    const renderUpiForm = () => (
        <div className="grid grid-cols-2 gap-3">
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="description">
                    Particular Description
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="description"
                    type="text"
                    placeholder="Enter Particular description"
                    value={formData.description || ''}
                    onChange={handleChange}
                />
            </div>
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
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="entryDate">
                    Entry Date
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="entryDate"
                    type="date"
                    value={formData.entryDate || ''}
                    onChange={handleChange}
                />
            </div>
        </div>
    );

    const renderCardForm = () => (
        <div className="grid grid-cols-2 gap-3">
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="description">
                    Particular Description
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="description"
                    type="text"
                    placeholder="Enter Particular description"
                    value={formData.description || ''}
                    onChange={handleChange}
                />
            </div>
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
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="issuingBank">
                    Issuing Bank
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="issuingBank"
                    type="text"
                    placeholder="Enter Issuing Bank"
                    value={formData.issuingBank || ''}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="cardholderName">
                    Cardholder Name
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="cardholderName"
                    type="text"
                    placeholder="Enter Cardholder Name"
                    value={formData.cardholderName || ''}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="entryDate">
                    Entry Date
                </label>
                <input
                    className="w-full appearance-none rounded border px-3 py-2 text-gray-700 shadow"
                    id="entryDate"
                    type="date"
                    value={formData.entryDate || ''}
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
        </div>
    );

    const renderEntryDetails = (item) => {
        if (!item) return null;

        switch (item.voucher) {
            case 'cheque':
                return (
                    <>
                        {item.chequeDetails?.chequeNumber && <div>Cheque Number : {item.chequeDetails.chequeNumber}</div>}
                        {item.chequeDetails?.chequeDate && <div>Cheque Date : {new Date(item.chequeDetails.chequeDate).toLocaleDateString('en-GB')}</div>}
                        {item.chequeDetails?.bankName && <div>Bank Name : {item.chequeDetails.bankName}</div>}
                        {item.chequeDetails?.branchName && <div>Branch Name : {item.chequeDetails.branchName}</div>}
                        {item.chequeDetails?.ifscCode && <div>IFSC Code : {item.chequeDetails.ifscCode}</div>}
                    </>
                );
            case 'net-banking':
                return (
                    <>
                        {item.net_banking?.transactionId && <div>Transaction ID : {item.net_banking.transactionId}</div>}
                        {item.net_banking?.transactionDate && (
                            <div>Transaction Date : {new Date(item.net_banking.transactionDate).toLocaleDateString('en-GB')}</div>
                        )}
                    </>
                );
            case 'upi':
                return (
                    <>
                        {item.upi?.upi_id && <div>UPI ID : {item.upi.upi_id}</div>}
                        {item.upi?.payerName && <div>Payer Name : {item.upi.payerName}</div>}
                        {item.upi?.transactionId && <div>Transaction ID : {item.upi.transactionId}</div>}
                    </>
                );
            case 'card':
                return (
                    <>
                        {item.credit_debit_card?.card_type && <div>Card Type : {item.credit_debit_card.card_type}</div>}
                        {item.credit_debit_card?.cardLastNo && <div>Last 4 Digits : {item.credit_debit_card.cardLastNo}</div>}
                        {item.credit_debit_card?.bankName && <div>Issuing Bank : {item.credit_debit_card.bankName}</div>}
                        {item.credit_debit_card?.cardHolderName && <div>Cardholder Name : {item.credit_debit_card.cardHolderName}</div>}
                    </>
                );
            default:
                return <div>No details available for this transaction type.</div>;
        }
    };

    return (
        <>
            {loadingForLedgerDetails ? (
                <Loading />
            ) : (
                <div className="flex flex-col gap-5 md:flex-row lg:px-20">
                    <div className="p-2 md:w-1/2">
                        <h1 className="mb-2 text-center text-2xl font-bold">Transation Details</h1>
                        <form className="mb-4 rounded-xl bg-white px-8 pt-6 pb-8 shadow-md" onSubmit={handleEntrySubmit}>
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

                    <div className="flex flex-col gap-5 md:w-1/2">
                        <div>
                            <div className="grid grid-cols-2 gap-2">
                                {proposalDataEntriesData.length > 0 &&
                                    proposalDataEntriesData.map((item) => (
                                        <div key={item?._id} className="rounded-lg border bg-white p-3 shadow-sm">
                                            <p className="mb-2 border-b pb-1 text-center font-bold">{item?.particular?.description?.split(' ')[1]}</p>

                                            <div className="space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Service Amount</span>
                                                    <span className="font-medium">
                                                        ₹
                                                        {item?.particular?.items
                                                            ?.find((i) => i?.subDescription === 'Service Amount')
                                                            ?.price?.toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">GST (18%)</span>
                                                    <span className="font-medium">
                                                        ₹{item?.particular?.items?.find((i) => i?.subDescription === '18% GST')?.price?.toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                                {item?.particular?.items?.find((i) => i?.subDescription === '2% TDS') && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">TDS (2%)</span>
                                                        <span className="font-medium">
                                                            ₹
                                                            {item?.particular?.items
                                                                ?.find((i) => i?.subDescription === '2% TDS')
                                                                ?.price?.toLocaleString('en-IN')}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="mt-1 flex justify-between border-t pt-1 font-bold">
                                                    <span>Total</span>
                                                    <span>
                                                        ₹
                                                        {item?.particular?.items
                                                            ?.find((i) => i?.subDescription === 'Total Amount')
                                                            ?.price?.toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>

                            <div className="mt-2 text-right font-bold">
                                Proposal Total : ₹{' '}
                                {proposalDataEntriesData
                                    ?.reduce((acc, item) => {
                                        const amount = item?.particular?.items?.find((i) => i?.subDescription === 'Total Amount')?.price;
                                        return acc + (amount || 0);
                                    }, 0)
                                    .toLocaleString('en-IN')}
                            </div>
                        </div>
                        <div className="border-t-2">
                            {ledgerData?.ledger?.entries?.length > 1 && (
                                <div>
                                    <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                                        {paymentDataList.map((item) => (
                                            <AccordionItem value={item?._id} key={item?._id}>
                                                <AccordionTrigger>
                                                    <div className="flex w-full gap-10 text-left">
                                                        <div className="w-1/4 capitalize">{item?.voucher}</div>
                                                        <div className="w-1/4 text-blue-400">₹ {item?.credit?.toLocaleString('en-IN')}</div>
                                                        <div className="w-1/4">{new Date(item?.date).toLocaleDateString('en-GB')}</div>
                                                        <div className="w-1/4">₹ {item?.balance?.toLocaleString('en-IN')}</div>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="grid grid-cols-2 gap-4 text-balance">{renderEntryDetails(item)}</AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CreateLedgerPage;
