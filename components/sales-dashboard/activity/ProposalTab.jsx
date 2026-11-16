// components/sales-dashboard/activity/ProposalTab.jsx

'use client';

import { proposalService } from '@/service/sales-dashboard/activity';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Building2, FileText, User } from 'lucide-react';
import Skeleton from '@/components/layout/Skeleton';
import Link from 'next/link';

const ProposalTab = ({ employeeId }) => {
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);

    async function fetchProposal() {
        try {
            setLoading(true);
            const res = await proposalService(employeeId);
            if (res.success) {
                setProposals(res.data);
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to fetch proposals');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (employeeId) {
            fetchProposal();
        }
    }, [employeeId]);

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 rounded-lg border bg-white p-4 shadow-sm">
                        <Skeleton count={3} />
                    </div>
                ))}
            </div>
        );
    }

    if (!proposals.length) {
        return <div className="flex h-40 items-center justify-center text-gray-500">No proposals found</div>;
    }

    return (
        <div className="mt-4 grid h-[calc(100vh-220px)] gap-4 overflow-y-auto pr-2 pb-4 md:grid-cols-2 lg:grid-cols-3">
            {proposals.map((item) => (
                <Link
                    href={`/sales-dashboard/proposal/pdf-download/${item._id}`}
                    key={item._id}
                    className="flex flex-col justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md"
                >
                    <div>
                        <div className="mb-3 flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-purple-50 p-2.5 text-purple-600">
                                    <FileText size={18} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-800">{item.proposalNo}</h3>
                                    <span className="text-[10px] text-gray-400">{formatDate(item.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 space-y-2 text-xs text-gray-600">
                            <div className="flex items-center gap-2">
                                <User size={14} className="text-gray-400" />
                                <span className="font-medium text-gray-700">{item.clientName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Building2 size={14} className="text-gray-400" />
                                <span>{item.clientCompany}</span>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default ProposalTab;
