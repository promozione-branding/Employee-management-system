// components/sales-dashboard/client/ProposalTab.jsx

'use client';

import Loading from '@/components/layout/Loading';
import { useSalesEmployeeStore } from '@/lib/store/salesEmployeeStore';

import { deleteProposalService, sendProposalPdfEmailService } from '@/service/proposal';
import { getProposalService } from '@/service/sales-dashboard/proposal';
import { Album, Check, Download, Mail, NotebookPen, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const ProposalTab = ({ customerId, salesPersonId }) => {
    const [listPropoasls, setListPropoasls] = useState([]);
    const [sendingInvoiceId, setSendingInvoiceId] = useState(null);
    const { employee, loading } = useSalesEmployeeStore();

    const router = useRouter();

    async function sendEmailHandler(proposalId) {
        if (sendingInvoiceId) return;
        setSendingInvoiceId(proposalId);
        const toastId = toast.loading('Sending email...');
        try {
            const res = await sendProposalPdfEmailService({ proposalId });
            if (res.success) {
                getAllCustomerPropsals();
                toast.success('Email sent successfully!', { id: toastId });
            } else {
                throw new Error(res.message || 'Failed to send email.');
            }
        } catch (error) {
            console.error('sendEmailHandler error:', error);
            toast.error(error.message || 'An error occurred.', { id: toastId });
        } finally {
            setSendingInvoiceId(null);
        }
    }

    async function getAllCustomerPropsals() {
        try {
            const allPropsals = await getProposalService(salesPersonId, customerId);
            if (allPropsals?.success) {
                toast.success('Proposal fetched');
                setListPropoasls(allPropsals.data);
                return;
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to fetch proposals');
        }
    }

    async function handleDeleteProposal(id) {
        const confirmed = window.confirm('Are you sure you want to delete this proposal?');
        if (confirmed) {
            try {
                const response = await deleteProposalService(id);
                if (response.success) {
                    toast.success(response.message);
                    getAllCustomerPropsals();
                }
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }
        }
    }

    console.log(employee?.user?._id);

    useEffect(() => {
        getAllCustomerPropsals();
    }, []);

    if (loading) {
        return <Loading />;
    }

    return (
        <div>
            <p className="mb-5 text-center text-2xl font-bold">All Proposals</p>
            {listPropoasls.length ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {listPropoasls.map((item) => (
                        <div
                            key={item?._id}
                            className={`rounded-lg border p-4 shadow-md ${
                                item?.ledgerEntry ? 'border border-blue-400' : 'bg-white'
                            } flex flex-col justify-between`}
                        >
                            <div>
                                <div className="flex justify-between">
                                    <p className="my-2 flex w-35 rounded-full bg-blue-300 px-3 py-1 font-medium">{item?.proposalNo}</p>
                                    <div
                                        className={` ${
                                            item?.ledgerEntry ? 'flex h-10 w-10 items-center justify-center rounded-full border shadow-2xl' : 'hidden'
                                        }`}
                                    >
                                        <Check />
                                    </div>
                                </div>
                                <h3 className="mb-2 truncate text-lg font-bold">{item?.clientCompany}</h3>
                                <p className="text-lg text-gray-800">
                                    <strong>Client:</strong> {item?.clientName}
                                </p>
                                <p className="text-lg text-gray-800">
                                    <strong>Client Address:</strong> {item?.clientAddress}
                                </p>
                                <p className="text-lg text-gray-800">
                                    <strong>Client GSTIN:</strong> {item?.GSTIN}
                                </p>

                                <p className="text-lg text-gray-800">
                                    <strong>Date:</strong> {new Date(item?.dateOfProposal).toLocaleDateString()}
                                </p>
                            </div>
                            <p className="mt-4 text-right text-xl font-semibold text-blue-600">₹{item?.totalAmount?.toLocaleString('en-IN') || 'Na'}</p>

                            <div className="mt-5 flex gap-4">
                                <Link
                                    href={`/sales-dashboard/proposal/pdf-download/${item?._id}`}
                                    className="flex h-10 w-10 items-center justify-center rounded-full border-black bg-gray-200"
                                >
                                    <Download />
                                </Link>
                                <button
                                    disabled={sendingInvoiceId === item?._id}
                                    onClick={() => sendEmailHandler(item?._id)}
                                    className={`flex h-10 w-10 items-center justify-center rounded-full border-black disabled:cursor-not-allowed disabled:opacity-50 ${item?.proposalSent ? 'border-1 border-blue-400 ' : 'border-black bg-gray-200'}`}
                                >
                                    {item?.proposalSent ? <Mail color="#2e7eff" /> : <Mail />}
                                </button>
                                <Link
                                    href={`/sales-dashboard/proposal/edit-proposal/${item?._id}`}
                                    className="flex h-10 w-10 items-center justify-center rounded-full border-black bg-gray-200"
                                >
                                    <Pencil />
                                </Link>
                                <div
                                    onClick={() => handleDeleteProposal(item?._id)}
                                    className="flex h-10 w-10 items-center justify-center rounded-full border-black bg-gray-200"
                                >
                                    <Trash2 />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-lg border-2 border-dashed p-8 text-center">
                    <p className="text-gray-500">No proposals found for this customer.</p>
                </div>
            )}

            <Link
                href={`/sales-dashboard/proposal/${customerId}`}
                className="fixed right-10 bottom-10 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500"
            >
                <Album size={30} />
            </Link>
        </div>
    );
};

export default ProposalTab;
