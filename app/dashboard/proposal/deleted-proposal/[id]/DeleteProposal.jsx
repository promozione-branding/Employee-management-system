// app/dashboard/proposal/deleted-proposal/[id]/DeleteProposal.jsx

'use client';
import { getClientProposalDeletedHistory } from '@/service/customer/history';
import React, { useEffect, useState } from 'react';

export default function ProposalDeletedHistory({ proposalId }) {
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState(null);

    useEffect(() => {
        async function fetchHistory() {
            try {
                const res = await getClientProposalDeletedHistory(proposalId);
                setHistory(res.data);
            } catch (err) {
                console.error('Error fetching history', err);
            } finally {
                setLoading(false);
            }
        }

        if (proposalId) fetchHistory();
    }, [proposalId]);

    if (loading) return <p className="p-4">Loading history...</p>;
    if (!history) return <p className="p-4">No history found</p>;

    const proposal = history.oldValue;

    return (
        <div className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-red-600">Deleted Proposal History</h2>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <p>
                    <strong>Proposal No:</strong> {proposal.proposalNo}
                </p>
                <p>
                    <strong>Client Name:</strong> {proposal.clientName}
                </p>
                <p>
                    <strong>Company:</strong> {proposal.clientCompany}
                </p>
                <p>
                    <strong>Total Amount:</strong> ₹{proposal.totalAmount}
                </p>
                <p>
                    <strong>Payment Method:</strong> {proposal.paymentMethod}
                </p>
                <p>
                    <strong>Date:</strong> {new Date(proposal.createdAt).toLocaleString()}
                </p>
            </div>

            <div className="mt-6">
                <h3 className="mb-2 font-semibold">Services</h3>
                <div className="space-y-3">
                    {proposal.services.map((service) => (
                        <div key={service._id} className="rounded-xl border bg-gray-50 p-4">
                            <p className="font-medium">{service.serviceTitle}</p>
                            <p>Amount: ₹{service.amount}</p>
                            <p>{service.discountAmount && `Discount: ₹${service?.discountAmount}`}</p>
                            <p>Final: ₹{service.finalAmount}</p>
                            <p className="text-xs text-gray-500">Duration: {service.duration}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6">
                <h3 className="font-semibold">Notes</h3>
                <p className="mt-1 text-sm text-gray-700">{proposal.notes}</p>
            </div>
        </div>
    );
}
