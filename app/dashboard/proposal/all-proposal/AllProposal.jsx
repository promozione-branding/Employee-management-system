// app/dashboard/proposal/all-proposal/AllProposal.jsx

'use client';

import Loading from '@/components/layout/Loading';
import { getAllProposals } from '@/service';
import { deleteProposalService } from '@/service/proposal';
import { Download, Eye, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

// Helper function to format the date
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

// Helper function to format currency
const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return 'N/A';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount);
};

const AllProposal = () => {
    const [loading, setLoading] = useState(true); // Start with loading true
    const [proposals, setProposals] = useState([]);

    async function handleDeleteProposal(id) {
        const confirmed = window.confirm('Are you sure you want to delete this proposal?');
        if (confirmed) {
            try {
                const response = await deleteProposalService(id);
                if (response.success) {
                    toast.success(response.message);
                    fetchAllProposals();
                }
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }
        }
    }

    const fetchAllProposals = async () => {
        try {
            const response = await getAllProposals();
            if (response?.success) {
                setProposals(response?.data);
            } else {
                toast.error(response?.message || 'Failed to fetch proposals.');
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false); // Stop loading in both success and error cases
        }
    };

    useEffect(() => {
        fetchAllProposals();
    }, []);

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="mb-8 text-center text-3xl font-bold">All Proposals</h1>

            {loading ? (
                <Loading />
            ) : proposals.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {proposals.map((item) => (
                        <div key={item?._id}>
                            <div>
                                <div className="block rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-shadow duration-300 hover:bg-gray-50 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                                    <p className="mb-3 font-normal text-gray-600 dark:text-gray-400">{item?.proposalNo || 'na'}</p>
                                    <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">{item.clientName}</h5>
                                    <p className="mb-3 font-normal text-gray-600 dark:text-gray-400">{item.clientCompany}</p>
                                    <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                        <p>Date: {formatDate(item.dateOfProposal)}</p>
                                        <p>GSTIN: {item.GSTIN}</p>
                                        <p className="mt-2 text-lg font-semibold text-gray-800 dark:text-white">{formatCurrency(item.totalAmount)}</p>
                                    </div>
                                    <div className="mt-5 flex gap-4">
                                        <Link
                                            href={`/dashboard/proposal/edit-proposal/${item?._id}`}
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
                                        <Link
                                            href={`/dashboard/proposal/pdf-download/${item?._id}`}
                                            className="flex h-10 w-10 items-center justify-center rounded-full border-black bg-gray-200"
                                        >
                                            <Download />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500">No proposals found.</p>
            )}
        </div>
    );
};

export default AllProposal;
